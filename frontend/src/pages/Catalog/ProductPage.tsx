import { useEffect, useState, useMemo, useRef } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { skipToken } from '@reduxjs/toolkit/query'
import DOMPurify from 'dompurify'

import PageContainer from '@/components/ui/PageContainer'
import Breadcrumbs from '@/pages/Catalog/components/Breadcrumbs'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setBreadcrumbs } from '@/features/catalogSlice'
import { productsApi, useGetProductBySlugQuery } from '@/api/productsApi'
import type { ProductContentBlock, GridCardItem, ProductDetail } from '@/api/productsApi'
import type { ProductVariant, SpecificationAttribute, SpecificationGroup } from '@/api/productsApi'
import { useGetCategoriesTreeQuery } from '@/api/categoriesApi'
import type { Category } from '@/api/categoriesApi'

import track from '@/assets/catalog/icons/fa_truck.svg'
import delivery from '@/assets/catalog/icons/time.svg'
import calendar from '@/assets/catalog/icons/calendar.svg'
import address from '@/assets/catalog/icons/addres.svg'
import { useTranslation } from 'react-i18next'
import { PopularProduct } from './components/PopularProduct'
import sampleImg from '@/assets/catalog/sample_machine.png'
import Contact from '@/components/common/Contact'
import { addToCart, incrementQuantity, decrementQuantity, removeFromCart } from '@/features/cartSlice'
import { useCartAnimation } from '@/components/animations/useCartAnimation'
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-KZ', {
    style: 'currency',
    currency: 'KZT',
    maximumFractionDigits: 0,
  }).format(price)
}

const findCategoryById = (categories: Category[], id: number): Category | null => {
  for (const cat of categories) {
    if (Number(cat.id) === id) return cat
    if (cat.children && cat.children.length > 0) {
      const found = findCategoryById(cat.children, id)
      if (found) return found
    }
  }
  return null
}

const PLACEHOLDER_IMG = 'https://placehold.co/600x400?text=No+Image'

type GalleryItem = {
  kind: 'image' | 'videoExternal' | 'videoFile'
  url: string
  preview: string
  embedUrl?: string
}

type BreadcrumbItem = {
  id?: number | string
  name: string
  slug?: string
  path: string
}

type HeaderSpecGroup = {
  isHeader: true
  name: string
  attributes?: never
}

type SpecGroup = SpecificationGroup | HeaderSpecGroup

const toYouTubeId = (url: string): string | null => {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace('www.', '')

    if (host === 'youtu.be') {
      const id = parsed.pathname.replace('/', '')
      return id || null
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname === '/watch') return parsed.searchParams.get('v')
      if (parsed.pathname.startsWith('/shorts/')) return parsed.pathname.split('/')[2] || null
      if (parsed.pathname.startsWith('/embed/')) return parsed.pathname.split('/')[2] || null
    }
  } catch {
    return null
  }

  return null
}

const toYouTubeEmbedUrl = (url: string): string | null => {
  const id = toYouTubeId(url)
  return id ? `https://www.youtube.com/embed/${id}` : null
}

const isVideoFileUrl = (url: string): boolean => /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)

const normalizeGallery = (
  media: Array<{ url?: string | null; type?: string | null; sortOrder?: number | null }> | null | undefined,
): GalleryItem[] => {
  if (!media || media.length === 0) {
    return [{ kind: 'image', url: PLACEHOLDER_IMG, preview: PLACEHOLDER_IMG }]
  }

  const sorted = [...media].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

  const mapped: GalleryItem[] = sorted
    .map((item) => {
      const url = String(item.url ?? '').trim()
      if (!url) return null

      const rawType = String(item.type ?? '').toUpperCase()
      const youtubeEmbed = toYouTubeEmbedUrl(url)

      if (rawType.includes('IMAGE')) {
        return { kind: 'image', url, preview: url }
      }

      if (rawType === 'VIDEO_EXTERNAL') {
        if (youtubeEmbed) {
          const id = toYouTubeId(url)
          const preview = id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : PLACEHOLDER_IMG
          return { kind: 'videoExternal', url, preview, embedUrl: youtubeEmbed }
        }
        return { kind: 'videoExternal', url, preview: PLACEHOLDER_IMG, embedUrl: url }
      }

      if (rawType.includes('VIDEO')) {
        if (youtubeEmbed) {
          const id = toYouTubeId(url)
          const preview = id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : PLACEHOLDER_IMG
          return { kind: 'videoExternal', url, preview, embedUrl: youtubeEmbed }
        }
        return { kind: 'videoFile', url, preview: PLACEHOLDER_IMG }
      }

      if (isVideoFileUrl(url)) return { kind: 'videoFile', url, preview: PLACEHOLDER_IMG }
      return { kind: 'image', url, preview: url }
    })
    .filter((item): item is GalleryItem => item !== null)

  return mapped.length > 0 ? mapped : [{ kind: 'image', url: PLACEHOLDER_IMG, preview: PLACEHOLDER_IMG }]
}

const imageWidthClassMap: Record<'1/3' | '1/2' | '2/3' | 'full', string> = {
  '1/3': 'lg:w-1/3',
  '1/2': 'lg:w-1/2',
  '2/3': 'lg:w-2/3',
  full: 'w-full',
}

const imageRatioClassMap: Record<'video' | 'square' | 'portrait', string> = {
  video: 'aspect-video',
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
}

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

const toStringValue = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return fallback
}

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value.map((item) => toStringValue(item).trim()).filter(Boolean)
}

const toRows = (value: unknown): string[][] => {
  if (!Array.isArray(value)) return []
  return value
    .map((row) => (Array.isArray(row) ? row.map((cell) => toStringValue(cell, '')) : []))
    .filter((row) => row.length > 0)
}

const normalizeContentBlocks = (value: unknown): ProductContentBlock[] => {
  if (!Array.isArray(value)) return []

  return value
    .map((rawBlock, idx): ProductContentBlock | null => {
      const block = toRecord(rawBlock)
      if (!block) return null

      const type = toStringValue(block.type)
      const data = toRecord(block.data) ?? {}
      const id = toStringValue(block.id, `block-${idx}`)

      if (type === 'heading') {
        const levelRaw = Number(block?.data && toRecord(block.data)?.level)
        const level = levelRaw === 1 || levelRaw === 2 || levelRaw === 3 ? levelRaw : 2
        return {
          id,
          type: 'heading',
          data: {
            text: toStringValue(data.text),
            level,
            subtitle: toStringValue(data.subtitle) || undefined,
          },
        }
      }

      if (type === 'paragraph') {
        return {
          id,
          type: 'paragraph',
          data: { text: toStringValue(data.text) },
        }
      }

      if (type === 'imageCard') {
        const position = toStringValue(data.position)
        const imageWidth = toStringValue(data.imageWidth)
        const imageRatio = toStringValue(data.imageRatio)
        const verticalAlign = toStringValue(data.verticalAlign)

        return {
          id,
          type: 'imageCard',
          data: {
            imageUrl: toStringValue(data.imageUrl),
            title: toStringValue(data.title),
            description: toStringValue(data.description),
            position: position === 'left' || position === 'right' || position === 'top' || position === 'bottom' ? position : 'left',
            imageWidth: imageWidth === '1/3' || imageWidth === '1/2' || imageWidth === '2/3' || imageWidth === 'full' ? imageWidth : '1/2',
            imageRatio: imageRatio === 'video' || imageRatio === 'square' || imageRatio === 'portrait' ? imageRatio : 'video',
            verticalAlign: verticalAlign === 'start' || verticalAlign === 'center' ? verticalAlign : 'start',
          },
        }
      }

      if (type === 'youtube') {
        return {
          id,
          type: 'youtube',
          data: {
            videoId: toStringValue(data.videoId),
            videoUrl: toStringValue(data.videoUrl) || undefined,
          },
        }
      }

      if (type === 'table') {
        return {
          id,
          type: 'table',
          data: { rows: toRows(data.rows) },
        }
      }

      if (type === 'gallery') {
        const layout = toStringValue(data.layout)
        return {
          id,
          type: 'gallery',
          data: {
            urls: toStringArray(data.urls),
            layout: layout === 'single' || layout === 'grid' || layout === 'carousel' || layout === 'featured' || layout === 'masonry'
              ? layout
              : 'grid',
          },
        }
      }

      if (type === 'list') {
        const styleRaw = toStringValue(data.style)
        const styleFromOrdered = data.ordered === true ? 'number' : 'bullet'
        const style = styleRaw || styleFromOrdered
        return {
          id,
          type: 'list',
          data: {
            items: toStringArray(data.items),
            style: style === 'bullet' || style === 'number' || style === 'check' || style === 'dash' || style === 'arrow' ? style : 'bullet',
          },
        }
      }

      if (type === 'cardGrid') {
        const columnsRaw = Number(data.columns)
        const columns = columnsRaw === 2 || columnsRaw === 3 || columnsRaw === 4 ? columnsRaw : 3
        const imageRatioRaw = toStringValue(data.imageRatio)
        const cardsRaw = Array.isArray(data.cards) ? data.cards : []

        const cards = cardsRaw
          .map((item) => toRecord(item))
          .filter((item): item is Record<string, unknown> => item !== null)
          .map((item) => ({
            imageUrl: toStringValue(item.imageUrl),
            title: toStringValue(item.title),
            description: toStringValue(item.description),
          }))

        return {
          id,
          type: 'cardGrid',
          data: {
            columns,
            imageRatio: imageRatioRaw === 'square' || imageRatioRaw === 'video' || imageRatioRaw === 'portrait' ? imageRatioRaw : 'video',
            cards,
          },
        }
      }

      if (type === 'productLink') {
        const layout = toStringValue(data.layout)
        return {
          id,
          type: 'productLink',
          data: {
            productIds: toStringArray(data.productIds),
            layout: layout === 'card' || layout === 'grid' || layout === 'carousel' ? layout : 'card',
          },
        }
      }

      return null
    })
    .filter((item): item is ProductContentBlock => item !== null)
}

const renderCardItem = (card: GridCardItem, idx: number, ratio: 'square' | 'video' | 'portrait') => (
  <article key={`${card.title}-${idx}`} className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
    <div className={`${imageRatioClassMap[ratio]} bg-gray-100 overflow-hidden group-hover:scale-105 transition-transform duration-500`}>
      <img
        src={card.imageUrl || PLACEHOLDER_IMG}
        alt={card.title}
        className="w-full h-full object-cover transition duration-500 hover:scale-[1.05]"
        loading="lazy"
      />
    </div>
    <div className="p-5 space-y-2">
      <h4 className="font-semibold text-gray-900">{card.title}</h4>
      <p className="text-sm text-gray-600 whitespace-pre-line">{card.description}</p>
    </div>
  </article>
)

type LinkedProductCard = Pick<ProductDetail, 'id' | 'slug' | 'name' | 'price' | 'oldPrice' | 'media' | 'inStock' | 'category'>

const getPrimaryImage = (media: LinkedProductCard['media']): string => {
  if (!media || media.length === 0) return PLACEHOLDER_IMG
  const firstImage = media.find((item) => String(item.type).toUpperCase().includes('IMAGE'))
  return firstImage?.url || media[0]?.url || PLACEHOLDER_IMG
}

const ProductLinksBlock = ({
  block,
}: {
  block: Extract<ProductContentBlock, { type: 'productLink' }>
}) => {
  const dispatch = useAppDispatch()
  const { i18n, t } = useTranslation()
  const [items, setItems] = useState<LinkedProductCard[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!block.data.productIds?.length) {
      return
    }

    let cancelled = false
    const loadingTimer = window.setTimeout(() => {
      if (!cancelled) setLoading(true)
    }, 0)

    const requests = block.data.productIds.map((value) => {
      const token = String(value).trim()
      if (/^\d+$/.test(token)) {
        return dispatch(productsApi.endpoints.getProductById.initiate(Number(token)))
      }
      return dispatch(productsApi.endpoints.getProductBySlug.initiate({ slug: token, lang: i18n.language }))
    })

    Promise.allSettled(requests.map((req) => req.unwrap()))
      .then((results) => {
        if (cancelled) return
        const loaded = results
          .filter((res): res is PromiseFulfilledResult<ProductDetail> => res.status === 'fulfilled')
          .map((res) => res.value)
          .map((prod) => ({
            id: prod.id,
            slug: prod.slug,
            name: prod.name,
            price: prod.price,
            oldPrice: prod.oldPrice,
            media: prod.media,
            inStock: prod.inStock,
            category: prod.category,
          }))
        setItems(loaded)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      window.clearTimeout(loadingTimer)
      requests.forEach((req) => req.unsubscribe())
    }
  }, [block.data.productIds, dispatch, i18n.language])

  const layoutClass =
    block.data.layout === 'grid'
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
      : block.data.layout === 'carousel'
        ? 'flex gap-4 overflow-x-auto pb-2 snap-x'
        : 'grid grid-cols-1 gap-4'

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">{t('productPage.relatedProducts')}</h3>

      {loading && <p className="text-sm text-gray-500">{t('productPage.loadingLinked')}</p>}

      {!loading && block.data.productIds?.length > 0 && items.length === 0 && (
        <p className="text-sm text-gray-500">{t('productPage.linkedNotFound')}</p>
      )}

      {items.length > 0 && (
        <div className={layoutClass}>
          {items.map((item) => (
            <Link
              key={item.id}
              to={`/catalog/product/${item.slug}`}
              className={`group rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                block.data.layout === 'carousel' ? 'min-w-[260px] snap-start' : ''
              }`}
            >
              <div className="aspect-[4/3] bg-gray-100 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                <img src={getPrimaryImage(item.media)} alt={item.name} className="w-full h-full object-cover transition duration-500 hover:scale-105" loading="lazy" />
              </div>
              <div className="p-4 space-y-2">
                <h4 className="font-medium text-gray-900 line-clamp-2 group-hover:text-[#F58322] transition-colors duration-300">{item.name}</h4>
                <div className="text-[#F58322] font-semibold">{formatPrice(item.price)}</div>
                {!item.inStock && <div className="text-xs text-gray-500">{t('commonCatalog.outOfStock')}</div>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

const renderContentBlock = (block: ProductContentBlock) => {
  switch (block.type) {
    case 'heading': {
      if (!block.data.text?.trim()) return null
      const HeadingTag = block.data.level === 1 ? 'h2' : block.data.level === 2 ? 'h3' : 'h4'
      return (
        <div key={block.id} className="space-y-2 border-l-4 border-[#F58322] pl-4 md:pl-5">
          <HeadingTag className="font-bold text-gray-900 text-xl md:text-2xl leading-tight">{block.data.text}</HeadingTag>
          {block.data.subtitle && <p className="text-sm text-gray-500 md:text-base">{block.data.subtitle}</p>}
        </div>
      )
    }
    case 'paragraph':
      if (!block.data.text?.trim()) return null
      return (
        <p key={block.id} className="text-gray-700 leading-relaxed whitespace-pre-line text-[15px] md:text-base">
          {block.data.text}
        </p>
      )
    case 'imageCard': {
      const isHorizontal = block.data.position === 'left' || block.data.position === 'right'
      const reverse = block.data.position === 'right' || block.data.position === 'bottom'
      const directionClass = isHorizontal ? 'lg:flex-row' : 'flex-col'
      const reverseClass = reverse ? (isHorizontal ? 'lg:flex-row-reverse' : 'flex-col-reverse') : ''
      const alignClass = block.data.verticalAlign === 'center' ? 'items-center' : 'items-start'
      const hasTitle = Boolean(block.data.title?.trim())
      const hasDescription = Boolean(block.data.description?.trim())

      return (
        <section
          key={block.id}
          className={`flex ${directionClass} ${reverseClass} ${alignClass} gap-5 rounded-2xl border border-gray-200 p-5 md:p-6 bg-gradient-to-b from-white to-gray-50/70 shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.01]`}
        >
          <div className={`w-full ${imageWidthClassMap[block.data.imageWidth]}`}>
            <div className={`${imageRatioClassMap[block.data.imageRatio]} rounded-xl overflow-hidden bg-gray-100 group`}>
              <img
                src={block.data.imageUrl || PLACEHOLDER_IMG}
                alt={block.data.title || 'content-image'}
                className="w-full h-full object-cover transition duration-500 hover:scale-110"
                loading="lazy"
              />
            </div>
          </div>
          {(hasTitle || hasDescription) && (
            <div className="flex-1 space-y-2">
              {hasTitle && <h3 className="font-semibold text-lg text-gray-900 md:text-xl">{block.data.title}</h3>}
              {hasDescription && <p className="text-sm text-gray-600 whitespace-pre-line md:text-base">{block.data.description}</p>}
            </div>
          )}
        </section>
      )
    }
    case 'youtube': {
      const embedUrl = block.data.videoId
        ? `https://www.youtube.com/embed/${block.data.videoId}`
        : block.data.videoUrl
          ? toYouTubeEmbedUrl(block.data.videoUrl)
          : null
      if (!embedUrl) return null

      return (
        <div key={block.id} className="aspect-video rounded-2xl overflow-hidden bg-black border border-gray-200 shadow-lg">
          <iframe
            src={embedUrl}
            title="product-content-video"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      )
    }
    case 'table': {
      if (!block.data.rows?.length) return null
      const [header, ...body] = block.data.rows
      return (
        <div key={block.id} className="overflow-x-auto border border-gray-200 rounded-2xl shadow-md bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                {header.map((cell, idx) => (
                  <th key={idx} className="px-4 py-3 text-left font-semibold border-b border-gray-200 whitespace-nowrap">{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, rowIdx) => (
                <tr key={rowIdx} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="px-4 py-3 text-gray-700">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
    case 'gallery': {
      if (!block.data.urls?.length) return null
      if (block.data.layout === 'carousel') {
        return (
          <div key={block.id} className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
            {block.data.urls.map((url, idx) => (
              <div
                key={`${url}-${idx}`}
                className="group snap-start min-w-[78%] sm:min-w-[56%] lg:min-w-[40%] rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shadow-md transition-all duration-300 hover:shadow-xl"
              >
                <img
                  src={url || PLACEHOLDER_IMG}
                  alt={`gallery-${idx + 1}`}
                  className="w-full h-full object-cover aspect-[4/3] transition duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )
      }

      if (block.data.layout === 'masonry') {
        return (
          <div key={block.id} className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {block.data.urls.map((url, idx) => (
              <div key={`${url}-${idx}`} className="mb-4 break-inside-avoid rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shadow-md transition-all duration-300 hover:shadow-xl">
                <img
                  src={url || PLACEHOLDER_IMG}
                  alt={`gallery-${idx + 1}`}
                  className="w-full h-auto object-cover transition duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )
      }

      if (block.data.layout === 'featured') {
        return (
          <div key={block.id} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {block.data.urls.map((url, idx) => (
              <div
                key={`${url}-${idx}`}
                className={`group rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shadow-md transition-all duration-300 hover:shadow-xl ${idx === 0 ? 'md:col-span-2' : ''}`}
              >
                <img
                  src={url || PLACEHOLDER_IMG}
                  alt={`gallery-${idx + 1}`}
                  className={`w-full h-full object-cover transition duration-500 group-hover:scale-110 ${idx === 0 ? 'aspect-[16/7]' : 'aspect-[4/3]'}`}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )
      }

      const gridClass = block.data.layout === 'single' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

      return (
        <div key={block.id} className={`grid ${gridClass} gap-4`}>
          {block.data.urls.map((url, idx) => (
            <div key={`${url}-${idx}`} className="group rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shadow-md transition-all duration-300 hover:shadow-xl">
              <img
                src={url || PLACEHOLDER_IMG}
                alt={`gallery-${idx + 1}`}
                className="w-full h-full object-cover aspect-[4/3] transition duration-500 group-hover:scale-110"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )
    }
    case 'list': {
      if (!block.data.items?.length) return null
      if (block.data.style === 'number') {
        return (
          <ol key={block.id} className="list-decimal pl-6 space-y-2 text-gray-700 marker:font-semibold marker:text-[#F58322]">
            {block.data.items.map((item, idx) => <li key={idx}>{item}</li>)}
          </ol>
        )
      }

      const markerByStyle: Record<'bullet' | 'check' | 'dash' | 'arrow', string> = {
        bullet: '•',
        check: '✓',
        dash: '—',
        arrow: '→',
      }
      const marker = markerByStyle[block.data.style]

      return (
        <ul key={block.id} className="space-y-2 text-gray-700">
          {block.data.items.map((item, idx) => (
            <li key={idx} className="flex gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 transition-all duration-300">
              <span className="text-[#F58322] font-semibold">{marker}</span>
              <span className="flex-1">{item}</span>
            </li>
          ))}
        </ul>
      )
    }
    case 'cardGrid': {
      const colsMap: Record<2 | 3 | 4, string> = {
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-2 lg:grid-cols-3',
        4: 'md:grid-cols-2 lg:grid-cols-4',
      }

      return (
        <div key={block.id} className={`grid grid-cols-1 ${colsMap[block.data.columns]} gap-5`}>
          {block.data.cards.map((card, idx) => renderCardItem(card, idx, block.data.imageRatio))}
        </div>
      )
    }
    case 'productLink':
      return (
        <ProductLinksBlock key={block.id} block={block} />
      )
    default:
      return null
  }
}

const ProductPage = () => {
  const { productSlug } = useParams()
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.cart.items)
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()
  const { i18n } = useTranslation()
  const { addAnimation } = useCartAnimation()

  const { data: product, isLoading, isError } = useGetProductBySlugQuery(
    productSlug ? { slug: productSlug, lang: i18n.language } : skipToken
  )
  const { data: categories = [] } = useGetCategoriesTreeQuery({ lang: i18n.language })

  const [activeImage, setActiveImage] = useState(0)
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'order'>('desc')

  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const SWIPE_THRESHOLD = 50

  const thumbsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!categories || categories.length === 0) return
    if (!product) return

    const breadcrumbs: BreadcrumbItem[] = [{ name: t('commonCatalog.catalog'), path: '/catalog' }]

    const productCategoryId =
      product.category?.id ?? Number(searchParams.get('categoryId'))

    if (!productCategoryId) {
      dispatch(setBreadcrumbs(breadcrumbs))
      return
    }

    const currentCategory = findCategoryById(categories, Number(productCategoryId))

    if (!currentCategory) {
      dispatch(setBreadcrumbs(breadcrumbs))
      return
    }

    const hasChildren = (cat: Category) => {
      if (cat.children && cat.children.length > 0) return true
      return categories.some((node) => Number(node.parentId) === Number(cat.id))
    }

    const stack: Category[] = []
    let temp: Category | null = currentCategory
    while (temp) {
      stack.push(temp)
      temp = temp.parentId ? findCategoryById(categories, Number(temp.parentId)) : null
    }

    stack.reverse().forEach(cat => {
      breadcrumbs.push({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        path: hasChildren(cat)
          ? `/catalog/${cat.slug}?categoryId=${cat.id}`
          : `/catalog/${cat.slug}/products/${cat.id}`
      })
    })

    breadcrumbs.push({
      id: product.id,
      name: product.name,
      path: `/catalog/product/${product.slug}`
    })

    dispatch(setBreadcrumbs(breadcrumbs))
  }, [product, categories, dispatch, searchParams, t])

  const gallery = useMemo(() => normalizeGallery(product?.media), [product?.media])
  const activeMedia = gallery[activeImage] ?? gallery[0]
  const cartImage = gallery[0]?.preview ?? PLACEHOLDER_IMG

  useEffect(() => {
    setActiveImage(0)
    setTimeout(() => {
      const node = thumbsRef.current?.children?.[0] as HTMLElement | undefined
      node?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }, 80)
  }, [product?.id])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        const ni = Math.max(0, activeImage - 1)
        setActiveImage(ni)
        const node = thumbsRef.current?.children?.[ni] as HTMLElement | undefined
        node?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      }
      if (e.key === 'ArrowRight') {
        const ni = Math.min(gallery.length - 1, activeImage + 1)
        setActiveImage(ni)
        const node = thumbsRef.current?.children?.[ni] as HTMLElement | undefined
        node?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeImage, gallery.length])

  const prevImage = () => {
    const ni = Math.max(0, activeImage - 1)
    setActiveImage(ni)
    const node = thumbsRef.current?.children?.[ni] as HTMLElement | undefined
    node?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }
  const nextImage = () => {
    const ni = Math.min(gallery.length - 1, activeImage + 1)
    setActiveImage(ni)
    const node = thumbsRef.current?.children?.[ni] as HTMLElement | undefined
    node?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX
    touchEndX.current = null
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX
  }
  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) nextImage()
      else prevImage()
    }
    touchStartX.current = null
    touchEndX.current = null
  }

  const goToIndex = (idx: number) => {
    const index = Math.max(0, Math.min(gallery.length - 1, idx))
    setActiveImage(index)
    const node = thumbsRef.current?.children?.[index] as HTMLElement | undefined
    node?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }

  const specRows = useMemo(() => {
    const rows: Array<{ type: 'header' | 'attr'; name: string; value?: string }> = []
    if (!product?.specifications || product.specifications.length === 0) return rows

    const specifications = product.specifications as SpecGroup[]

    specifications.forEach((item) => {
      if ('isHeader' in item && item.isHeader) {
        rows.push({ type: 'header', name: item.name })
      } else {
        item.attributes?.forEach((atr: SpecificationAttribute) => {
          rows.push({ type: 'attr', name: atr.name, value: atr.value })
        })
      }
    })

    return rows
  }, [product?.specifications])

  const rowsWithBg = useMemo(() => {
    let attrIndex = 0
    return specRows.map(row => {
      if (row.type === 'attr') {
        const bg = attrIndex % 2 === 0 ? 'bg-[#F5F7FA]' : 'bg-white'
        attrIndex++
        return { ...row, bg }
      }
      return { ...row, bg: 'bg-[#E6EDF5]' }
    })
  }, [specRows])

  const normalizedContentBlocks = useMemo(
    () => normalizeContentBlocks(product?.contentBlocks),
    [product?.contentBlocks],
  )

  const safeDescriptionHtml = useMemo(
    () => DOMPurify.sanitize(product?.description || '', {
      ALLOWED_TAGS: ['p', 'br', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'h2', 'h3', 'h4', 'blockquote'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
    }),
    [product?.description],
  )

  if (isLoading) {
    return (
      <PageContainer>
        <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center items-center min-h-[50vh]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <span className="mt-4 text-gray-500">{t('productPage.loadingProduct')}</span>
          </div>
        </div>
      </PageContainer>
    )
  }

  if (isError || !product) {
    return (
      <PageContainer>
        <div className="max-w-7xl mx-auto px-4 py-12 text-center min-h-[50vh] flex flex-col justify-center items-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('productPage.notFoundTitle')}</h2>
          <p className="text-gray-600 mb-6">{t('productPage.error')}</p>
          <Link to="/catalog" className="bg-[#F58322] text-white px-6 py-2 rounded hover:bg-[#DB741F] transition">
            {t("productPage.errorBack")}
          </Link>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="px-4 md:px-6 lg:px-0 mb-20">
        <div className="my-4 text-sm text-gray-500">
          <Breadcrumbs />
        </div>

        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase text-gray-900 mb-8 font-oswald leading-tight">
          {product.name}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          <div>
            <div
              className="rounded-2xl overflow-hidden mb-4 flex relative bg-white border border-gray-200 shadow-lg aspect-[4/3] items-center justify-center"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {activeMedia?.kind === 'image' && (
                <img
                  src={activeMedia.url || PLACEHOLDER_IMG}
                  alt={product.name || 'product image'}
                  className="object-contain w-full h-full max-h-[520px] transition-transform duration-300 hover:scale-105"
                />
              )}

              {activeMedia?.kind === 'videoExternal' && (
                <iframe
                  src={activeMedia.embedUrl || activeMedia.url}
                  title={product.name || 'product video'}
                  className="w-full h-full min-h-[240px] md:min-h-[360px] bg-black"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              )}

              {activeMedia?.kind === 'videoFile' && (
                <video
                  src={activeMedia.url}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full max-h-[520px] bg-black"
                />
              )}

              {product.discountPercent && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-1.5 text-sm font-bold rounded-lg shadow-lg">
                  -{product.discountPercent}%
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-4">
              <div className="w-full max-w-[720px] flex justify-center">
                <div
                  ref={thumbsRef}
                  className="flex gap-3 overflow-x-auto px-2 py-1 scrollbar-thin"
                >
                  {gallery.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToIndex(idx)}
                      className={`
                        flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 focus:outline-none transition-all duration-300
                        ${activeImage === idx
                          ? 'border-[#F58322] ring-4 ring-[#F58322]/30 scale-105 shadow-lg'
                          : 'border-transparent hover:border-gray-300 hover:scale-105 hover:shadow-md'}
                      `}
                      aria-label={t('productPage.showImage', { index: idx + 1 })}
                    >
                      {item.kind === 'image' ? (
                        <img src={item.preview} alt={`${product.name}-${idx}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-black/80 text-white flex items-center justify-center relative">
                          <img src={item.preview} alt={`${product.name}-${idx}`} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                          <span className="relative z-10 w-8 h-8 rounded-full bg-black/65 border border-white/40 flex items-center justify-center">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div>
              <div className="flex flex-col sm:flex-row border-b gap-5 border-gray-100 pb-6">
                <div className='bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border border-gray-200 shadow-lg w-full sm:w-2/3 transition-all duration-300 hover:shadow-xl'>
                  <div className="mb-4">
                    {product.oldPrice && (
                      <div className="text-gray-400 line-through text-lg font-medium">
                        {formatPrice(product.oldPrice)}
                      </div>
                    )}
                    <div className="text-3xl font-extrabold text-gray-900 mb-1">
                      {formatPrice(product.price)}
                    </div>

                    {product.inStock ? (
                      <span className="text-green-600 text-sm font-medium flex items-center gap-1 mb-5">
                        {t("productPage.have")} {product.stockQuantity > 0 && `(${product.stockQuantity} ${t('productPage.pieces')})`}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm font-medium flex items-center gap-1 mb-5">
                        {t("productPage.haveNot")}
                      </span>
                    )}
                  </div>
                  {items.find((item) => item.id === product.id) ? (
                    <div className="flex items-center justify-between bg-[#F58322] rounded-xl overflow-hidden shadow-lg">
                      <button
                        type="button"
                        className="w-12 h-12 flex items-center justify-center text-white font-bold hover:bg-[#DB741F] transition-all duration-300"
                        onClick={() => {
                          const currentQty = items.find((item) => item.id === product.id)?.quantity ?? 1
                          if (currentQty <= 1) {
                            dispatch(removeFromCart(product.id))
                          } else {
                            dispatch(decrementQuantity(product.id))
                          }
                        }}
                      >
                        −
                      </button>
                      <span className="text-white font-bold text-lg">
                        {items.find((item) => item.id === product.id)?.quantity}
                      </span>
                      <button
                        type="button"
                        className="w-12 h-12 flex items-center justify-center text-white font-bold hover:bg-[#DB741F] transition-all duration-300"
                        onClick={() => {
                          dispatch(incrementQuantity(product.id))
                        }}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      disabled={!product.inStock}
                      onClick={(event) => {
                        addAnimation(product.id, cartImage, event)
                        dispatch(
                          addToCart({
                            id: product.id,
                            slug: product.slug,
                            name: product.name,
                            image: cartImage,
                            price: product.price,
                            oldPrice: product.oldPrice,
                            inStock: product.inStock,
                          })
                        )
                      }}
                      className={`w-full px-10 py-3 text-white font-bold uppercase transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]
                        ${product.inStock ? 'bg-[#F58322] hover:bg-[#DB741F]' : 'bg-gray-400 cursor-not-allowed'}`}
                    >
                      {product.inStock ? t('productPage.buy') : t('productPage.notify')}
                    </button>
                  )}
                </div>
                <div className="space-y-3 text-sm pt-2 w-full sm:w-1/3">
                  {rowsWithBg.filter(r => r.type === 'attr').slice(0, 4).map((r, i) => (
                    <div key={`mini-${i}`} className="flex justify-between gap-2 border-b border-gray-100 pb-2">
                      <span className="text-gray-500">{r.name}</span>
                      <span className="font-medium text-gray-900 text-right">{r.value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <div className="p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl text-sm text-gray-600 border border-gray-200 shadow-sm">
                  <h5 className="text-[#F58322] font-bold mb-2 text-xs uppercase">{t('productPage.conditionsReturn')}</h5>
                  <div className='flex justify-between flex-wrap gap-2'>
                    <p>
                      {t('productPage.conditions')}
                    </p>
                    <a href="#" className="font-bold hover:underline whitespace-nowrap text-[#F58322] hover:text-[#DB741F] transition-colors">{t('productPage.more')} →</a>
                  </div>
                </div>

                <div className="space-y-3 text-xs font-bold text-gray-500 uppercase mt-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-300 text-[#F58322]">
                    <span className="text-[#F58322]"><img src={track} alt="" className="w-5 h-5" /></span> 
                    <span className="hover:text-[#DB741F] transition-colors">{t('productPage.delive')}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-300 text-[#F58322]">
                    <span className="text-[#F58322]"><img src={delivery} alt="" className="w-5 h-5" /></span> 
                    <span className="hover:text-[#DB741F] transition-colors">{t('productPage.pay')}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-300 text-[#F58322]">
                    <span className="text-[#F58322]"><img src={calendar} alt="" className="w-5 h-5" /></span> 
                    <span className="hover:text-[#DB741F] transition-colors">{t('productPage.work')}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-300 text-[#F58322]">
                    <span className="text-[#F58322]"><img src={address} alt="" className="w-5 h-5" /></span> 
                    <span className="hover:text-[#DB741F] transition-colors">{t('productPage.adress')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* tabs */}
        <div className="border-b border-gray-200 mb-8">
          <div className="flex gap-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-4 px-2 font-bold uppercase text-sm transition-all duration-300 whitespace-nowrap border-b-2 
                  ${activeTab === 'desc' ? 'border-[#F58322] text-[#F58322]' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'}`}
            >
              {t('productPage.descriprion')}
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-4 px-2 font-bold uppercase text-sm transition-all duration-300 whitespace-nowrap border-b-2 
                  ${activeTab === 'specs' ? 'border-[#F58322] text-[#F58322]' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'}`}
            >
              {t('productPage.certificate')}
            </button>
            <button
              onClick={() => setActiveTab('order')}
              className={`pb-4 px-2 font-bold uppercase text-sm transition-all duration-300 whitespace-nowrap border-b-2 
                  ${activeTab === 'order' ? 'border-[#F58322] text-[#F58322]' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'}`}
            >
              {t('productPage.information')}
            </button>
          </div>
        </div>

        {activeTab === 'desc' && (
          <div className="animate-fade-in text-gray-800 product-content-adaptive">
            {normalizedContentBlocks.length > 0 ? (
              <div className="space-y-6 mb-8">
                {normalizedContentBlocks.map((block) => renderContentBlock(block))}
              </div>
            ) : (
              <div className="mb-8">
                <div
                  className="prose max-w-none text-sm leading-relaxed text-gray-700"
                  dangerouslySetInnerHTML={{ __html: safeDescriptionHtml }}
                />
              </div>
            )}

            {product.variants && product.variants.length > 0 && (
              <div className="mt-12 overflow-x-auto">
                <h4 className="font-bold uppercase mb-4 text-sm tracking-wide text-gray-800">{t('productPage.model')}</h4>
                <div className="md:hidden space-y-3">
                  {product.variants.map((variant: ProductVariant) => (
                    <article key={variant.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-md transition-all duration-300 hover:shadow-lg">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="text-[#F58322] font-bold leading-tight">{variant.name}</div>
                          <div className="text-gray-400 text-xs mt-1">{variant.sku}</div>
                        </div>
                        <div className="text-right text-sm font-bold text-gray-900 whitespace-nowrap">
                          {formatPrice(variant.price)}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {Object.entries(variant.attributes ?? {}).map(([attrKey, attrValue]) => (
                          <div key={`${variant.id}-${attrKey}`} className="flex justify-between items-start gap-4 border-t border-gray-100 pt-2 text-sm">
                            <span className="text-gray-500 capitalize">{attrKey}</span>
                            <span className="font-medium text-gray-900 text-right">{String(attrValue ?? '—')}</span>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>

                <table className="hidden md:table w-full min-w-[900px] border-collapse text-[13px] text-center border border-gray-300">
                  <thead>
                    <tr className="bg-white text-gray-800 font-bold border-b border-gray-300">
                      <th className="p-3 border-r border-gray-300 text-left w-[180px]">{t('productPage.sku')}</th>
                      <th className="p-3 border-r border-gray-300">{t('filters.price')}</th>
                      {Object.keys(product.variants[0].attributes).map(attrName => (
                        <th key={attrName} className="p-3 border-r border-gray-300 capitalize">{attrName}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((variant: ProductVariant) => (
                      <tr key={variant.id} className="border-b border-gray-300 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="p-3 border-r border-gray-300 text-left align-top">
                          <div className="text-[#F58322] font-bold leading-tight">{variant.name}</div>
                          <div className="text-gray-400 text-xs mt-1">{variant.sku}</div>
                        </td>
                        <td className="p-3 border-r border-gray-300 font-medium text-gray-700 whitespace-nowrap">
                          {formatPrice(variant.price)}
                        </td>
                        {Object.keys(product.variants![0].attributes).map((attrKey) => (
                          <td key={attrKey} className="p-3 border-r border-gray-300 font-medium text-gray-700">
                            {variant.attributes[attrKey]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="mt-4">
            {product.specifications && product.specifications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {(product.specifications as SpecGroup[]).map((item, blockIdx: number) => {
                  if ('isHeader' in item && item.isHeader) {
                    return (
                      <div key={`header-${blockIdx}`} className="md:col-span-2 bg-gradient-to-r from-[#E6EDF5] to-[#F0F5FA] px-4 py-3 rounded-xl">
                        <div className="font-bold text-xs uppercase text-gray-800">• {item.name}</div>
                      </div>
                    )
                  }

                  const mainIsGray = blockIdx % 2 === 0
                  const mainBg = mainIsGray ? 'bg-[#F5F7FA]' : 'bg-white'

                  return (
                    <div
                      key={`block-${blockIdx}`}
                      className={`${mainBg} self-start rounded-2xl border border-gray-100 overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg`}
                    >
                      {item.name && (
                        <div className={`${mainBg} px-4 py-3 border-b border-gray-100`}>
                          <div className="font-semibold text-gray-800">{item.name}</div>
                        </div>
                      )}
                      <div>
                        {item.attributes?.map((atr: SpecificationAttribute, aIdx: number) => {
                          const childIsGray = mainIsGray ? (aIdx % 2 === 1) : (aIdx % 2 === 0)
                          const childBg = childIsGray ? 'bg-[#F5F7FA]' : 'bg-white'

                          return (
                            <div
                              key={`atr-${blockIdx}-${aIdx}`}
                              className={`${childBg} px-4 py-3 flex justify-between items-start border-b border-gray-100 transition-colors hover:bg-gray-50`}
                            >
                              <div className="text-gray-600">• {atr.name}</div>
                              <div className="font-medium text-gray-900 text-right max-w-[60%] whitespace-pre-wrap">
                                {atr.value ?? '—'}
                                {" "}
                                {atr.unit}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="py-4 text-gray-500">{t('productPage.noChcaracter')}</p>
            )}
          </div>
        )}
        {activeTab === 'order' && (
          <div className="animate-fade-in text-gray-800 py-4">
            <p className="mb-4">{t('productPage.forOrder')}</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>{t('productPage.phone')} <a href="tel:+77777777777" className="text-[#F58322] font-bold">+7 (777) 777-77-77</a></li>
              <li>{t('productPage.Email')} <a href="mailto:sales@example.com" className="text-[#F58322] font-bold">sales@example.com</a></li>
            </ul>
            <p className="mt-4 text-sm text-gray-500">
              {t('productPage.artic')}: <span className="font-bold text-gray-900">{product.sku}</span>
            </p>
          </div>
        )}
        <PopularProduct />
        <section className='mb-16'>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="px-2 md:px-0">
              <h3 className="font-oswald text-4xl sm:text-5xl font-bold uppercase mb-8 ml-4">
                {t("catalogPage.bid")}
              </h3>
              <Contact productId={product.id} />
            </div>
            <div className="hidden md:flex justify-center md:justify-end px-2 md:px-0">
              <img src={sampleImg} alt="machine" className="max-w-full w-72 sm:w-full object-contain" />
            </div>
          </div>
        </section>
      </div>
    </PageContainer>
  )
}

export default ProductPage
