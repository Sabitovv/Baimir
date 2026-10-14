import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { skipToken } from '@reduxjs/toolkit/query'
import { useGetProductBySlugQuery } from '@/api/productsApi'
import { useGetCategoriesTreeQuery, useGetProductsQuery } from '@/api/categoriesApi'
import { useGetBlogBySlugQuery, useGetBlogsQuery } from '@/api/blogsApi'
import { useGetProductCollectionBySlugQuery } from '@/api/productCollectionsApi'
import {
  SITE_ORIGIN, DEFAULT_DESCRIPTION, productSeo, staticPage,
  categorySeo, flattenCategories, productBreadcrumbs, breadcrumbSchema,
  catalogGraph, categoryGraph, catalogParameters, catalogNoindex, categoryCatalogParameters,
  blogSeo, blogBreadcrumbs, localizedText, languagePath, languageAlternates,
} from '../../../seo.mjs'

const setMeta = (key: 'name' | 'property', name: string, content: string) => {
  const tag = document.head.querySelector<HTMLMetaElement>(`meta[${key}="${name}"]`) || document.createElement('meta')
  tag.setAttribute(key, name)
  tag.content = content
  if (!tag.isConnected) document.head.appendChild(tag)
}

// A single owner updates metadata for both direct loads and client-side navigation.
export default function SeoController() {
  const { pathname, search } = useLocation()
  const { i18n } = useTranslation()
  const route = pathname.replace(/\/$/, '') || '/'
  const slug = pathname.match(/^\/catalog\/product\/([^/]+)\/?$/)?.[1]
  const blogSlug = pathname.match(/^\/blog\/([^/]+)\/?$/)?.[1]
  const collectionSlug = pathname.match(/^\/collections\/([^/]+)\/?$/)?.[1]
  const categoryMatch = pathname.match(/^\/catalog\/([^/]+)(?:\/products\/(\d+))?\/?$/)
  const categorySlug = categoryMatch?.[1]
  const categoryId = categoryMatch?.[2]
  const { currentData: product, error: productError, isFetching } = useGetProductBySlugQuery(
    slug ? { slug, lang: i18n.language } : skipToken,
  )
  const { currentData: blog, error: blogError, isFetching: blogFetching } = useGetBlogBySlugQuery(
    blogSlug ? { slug: blogSlug, lang: i18n.language } : skipToken,
  )
  const { currentData: collection, error: collectionError, isFetching: collectionFetching } = useGetProductCollectionBySlugQuery(
    collectionSlug ? { slug: collectionSlug, lang: i18n.language } : skipToken,
  )
  const { currentData: categories, error: categoriesError, isFetching: categoriesFetching } = useGetCategoriesTreeQuery(
    categoryMatch || route === '/catalog' ? { lang: i18n.language } : skipToken,
  )
  const flatCategories = useMemo(() => flattenCategories(categories), [categories])
  const category = useMemo(() => flatCategories.find((item) => categoryId ? String(item.id) === categoryId : item.slug === categorySlug), [flatCategories, categoryId, categorySlug])
  const hasChildren = category && flatCategories.some((item) => item.parentId != null && String(item.parentId) === String(category.id))
  const params = useMemo(() => catalogParameters(search), [search])
  const { currentData: blogs, error: blogsError, isFetching: blogsFetching } = useGetBlogsQuery(
    route === '/blog' ? { page: params.page, size: 12, lang: i18n.language } : skipToken,
  )
  const { currentData: categoryProducts, isFetching: productsFetching, error: productsError } = useGetProductsQuery(
    category && !hasChildren ? { categoryId: Number(category.id), ...categoryCatalogParameters(category, flatCategories, search), lang: i18n.language } : skipToken,
  )

  useEffect(() => {
    const page = staticPage(route, i18n.language)
    let metadata = { title: page ? `${page.name} | Baytech` : 'Baytech — промышленное оборудование в Казахстане', description: page?.description || DEFAULT_DESCRIPTION, url: `${SITE_ORIGIN}${languagePath(route, i18n.language)}` }
    let graph: Record<string, unknown>[] = []
    let image = ''
    let alternateLanguages: string[] | undefined
    let noindex = route === '/compare' || /(?:^|\/)deep-products(?:\/|$)/.test(route)

    if (slug && product) {
      const seo = productSeo(product, SITE_ORIGIN, i18n.language)
      metadata = seo
      noindex = !seo.indexable; alternateLanguages = seo.languages
      image = seo.images[0] || ''
      graph = [seo.schema, breadcrumbSchema(seo.url, productBreadcrumbs(product, SITE_ORIGIN, i18n.language))]
    } else if (slug && productError) {
      const missing = 'status' in productError && productError.status === 404
      metadata.title = missing ? 'Товар не найден | Baytech' : 'Каталог временно недоступен | Baytech'
      noindex = true
    } else if (slug && isFetching) {
      // Preserve server metadata while the same product is loading, but never the previous product.
      const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
      if (canonical?.href === metadata.url) return
    } else if (blogSlug && blog) {
      const seo = blogSeo(blog, SITE_ORIGIN, i18n.language)
      metadata = seo; image = seo.images[0] || ''
      noindex = !seo.indexable; alternateLanguages = seo.languages
      graph = [seo.schema, breadcrumbSchema(seo.url, blogBreadcrumbs(blog, SITE_ORIGIN, i18n.language))]
    } else if (blogSlug && blogError) {
      metadata.title = 'status' in blogError && blogError.status === 404 ? 'Статья не найдена | Baytech' : 'Блог временно недоступен | Baytech'
      noindex = true
    } else if (blogSlug && blogFetching) {
      if (document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href === metadata.url) return
    } else if (collectionSlug && collection) {
      metadata.title = `${collection.name} | Baytech`; metadata.description = collection.name
      graph = [{ '@type': 'CollectionPage', '@id': `${metadata.url}#collectionpage`, url: metadata.url, name: collection.name },
        breadcrumbSchema(metadata.url, [{ name: 'Baytech', item: `${SITE_ORIGIN}${languagePath('/', i18n.language)}` }, { name: collection.name, item: metadata.url }])]
    } else if (collectionSlug && collectionError) {
      metadata.title = 'Подборка не найдена | Baytech'; noindex = true
    } else if (collectionSlug && collectionFetching) {
      if (document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href === metadata.url) return
    } else if (category) {
      metadata = categorySeo(category, params.page, SITE_ORIGIN, i18n.language)
      // Keep complete SSR graph during the initial load of this same page.
      // New pages never inherit the previous category's ItemList.
      const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
      if (!hasChildren && !categoryProducts && productsFetching && canonical?.href === metadata.url) return
      graph = categoryGraph(category, flatCategories, categoryProducts?.products, params.page, SITE_ORIGIN, i18n.language)
      if (productsError) noindex = true
      if (categoryProducts && params.page > Math.max(1, categoryProducts.meta.totalPages)) {
        metadata.title = 'Страница не найдена | Baytech'; noindex = true; graph = []
      } else if (catalogNoindex(search)) {
        noindex = true; graph = graph.filter(item => item['@type'] !== 'ItemList')
      }
    } else if (route === '/catalog' && categories) {
      graph = catalogGraph(flatCategories, SITE_ORIGIN, i18n.language)
    } else if ((categorySlug && categorySlug !== 'deep-products') || route === '/catalog') {
      const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
      const pendingUrl = `${SITE_ORIGIN}${languagePath(route, i18n.language)}${params.page > 1 ? `?page=${params.page}` : ''}`
      if (!categories && categoriesFetching && canonical?.href === pendingUrl) return
      if (categoriesError) {
        metadata.title = 'Каталог временно недоступен | Baytech'
        noindex = true
      } else if (categories && categorySlug) {
        metadata.title = 'Категория не найдена | Baytech'
        noindex = true
      }
    } else if (route === '/blog' && page) {
      metadata.url += params.page > 1 ? `?page=${params.page}` : ''
      metadata.title = `${page.name}${params.page > 1 ? ` — ${params.page}` : ''} | Baytech`
      if (blogsFetching && !blogs && document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href === metadata.url) return
      if (blogsError || blogs && params.page > Math.max(1, blogs.totalPages)) noindex = true
      graph = [{ '@type': 'CollectionPage', '@id': `${metadata.url}#collectionpage`, url: metadata.url, name: page.name, description: page.description },
        breadcrumbSchema(metadata.url, [{ name: 'Baytech', item: `${SITE_ORIGIN}${languagePath('/', i18n.language)}` }, { name: page.name, item: metadata.url }]),
        ...(blogs && !noindex ? [{ '@type': 'ItemList', '@id': `${metadata.url}#itemlist`, numberOfItems: blogs.content.length,
          itemListElement: blogs.content.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: localizedText(item.title, i18n.language), url: blogSeo(item, SITE_ORIGIN, i18n.language).url })) }] : [])]
    } else if (page) {
      graph = [{ '@type': 'WebPage', '@id': `${metadata.url}#webpage`, url: metadata.url, name: page.name, description: page.description, isPartOf: { '@id': `${SITE_ORIGIN}/#website` } }]
    } else if (!noindex) {
      metadata.title = 'Страница не найдена | Baytech'; noindex = true
    }

    document.title = metadata.title
    document.documentElement.lang = i18n.language === 'kz' ? 'kk' : i18n.language || 'ru'
    setMeta('name', 'description', metadata.description)
    setMeta('name', 'robots', noindex ? 'noindex,follow' : 'index,follow')
    setMeta('property', 'og:title', metadata.title)
    setMeta('property', 'og:description', metadata.description)
    setMeta('property', 'og:url', metadata.url)
    setMeta('property', 'og:type', slug && product ? 'product' : blogSlug && blog ? 'article' : 'website')
    setMeta('property', 'og:site_name', 'Baytech')
    if (image) setMeta('property', 'og:image', image)
    else document.head.querySelector('meta[property="og:image"]')?.remove()
    const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]') || document.createElement('link')
    canonical.rel = 'canonical'
    canonical.href = metadata.url
    if (!canonical.isConnected) document.head.appendChild(canonical)
    document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach(link => link.remove())
    if (!noindex) for (const alternate of languageAlternates(metadata.url, SITE_ORIGIN, alternateLanguages)) {
      const link = document.createElement('link')
      link.rel = 'alternate'; link.hreflang = alternate.hreflang; link.href = alternate.href
      document.head.appendChild(link)
    }

    const schema = document.getElementById('baytech-schema') || document.createElement('script')
    let globalGraph: Record<string, unknown>[] = []
    try {
      const existing: { '@graph'?: Record<string, unknown>[] } = JSON.parse(schema.textContent || '{}')
      globalGraph = (existing['@graph'] || []).filter((item) => ['Organization', 'WebSite'].includes(String(item['@type'])))
    } catch { /* A malformed old schema must not block fresh metadata. */ }
    schema.id = 'baytech-schema'
    schema.setAttribute('type', 'application/ld+json')
    schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': [...globalGraph, ...graph] }).replace(/</g, '\\u003c')
    if (!schema.isConnected) document.head.appendChild(schema)
  }, [route, search, slug, blogSlug, blog, blogError, blogFetching, blogs, blogsError, blogsFetching, collectionSlug, collection, collectionError, collectionFetching, categorySlug, product, productError, isFetching, categories, categoriesError, categoriesFetching, category, flatCategories, hasChildren, categoryProducts, productsFetching, productsError, params.page, i18n.language])

  return null
}
