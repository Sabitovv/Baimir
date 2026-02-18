import { useEffect, useState, useMemo, useRef } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { skipToken } from '@reduxjs/toolkit/query'

import PageContainer from '@/components/ui/PageContainer'
import Breadcrumbs from '@/pages/Catalog/components/Breadcrumbs'
import { useAppDispatch } from '@/app/hooks'
import { setBreadcrumbs } from '@/features/catalogSlice'
import { useGetProductBySlugQuery } from '@/api/productsApi'
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

const ProductPage = () => {
  const { productSlug } = useParams()
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()

  const { data: product, isLoading, isError } = useGetProductBySlugQuery(
    productSlug ?? skipToken
  )
  const { data: categories = [] } = useGetCategoriesTreeQuery()

  const [activeImage, setActiveImage] = useState(0)
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'order'>('desc')

  // touch swipe support
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const SWIPE_THRESHOLD = 50

  // ref for thumbnails container so we can scroll thumbnails into view
  const thumbsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!categories || categories.length === 0) return
    if (!product) return

    const breadcrumbs: any[] = [{ name: 'Каталог', path: '/catalog' }]

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
      if ((cat as any).children && (cat as any).children.length > 0) return true

      const queue: any[] = Array.isArray(categories) ? [...(categories as any[])] : []
      while (queue.length) {
        const node = queue.shift()
        if (!node) continue
        if (Number(node.parentId) === Number(cat.id)) return true
        if (node.children && node.children.length) queue.push(...node.children)
      }
      return false
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
      path: `/catalog/${currentCategory.slug}/products/${currentCategory.id}/${product.slug}`
    })

    dispatch(setBreadcrumbs(breadcrumbs))
  }, [product, categories, dispatch, searchParams])

  // images from API (case-insensitive 'IMAGE'), keep order if sortOrder exists
  const images = useMemo(() => {
    if (!product?.media || product.media.length === 0) return [PLACEHOLDER_IMG]

    const imgs = product.media
      .filter((m: any) => m?.url && String(m.type ?? '').toUpperCase() === 'IMAGE')
      .slice()

    if (imgs.some((i: any) => typeof i.sortOrder === 'number')) {
      imgs.sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    }

    const mapped = imgs.map((m: any) => m.url)
    return mapped.length > 0 ? mapped : [PLACEHOLDER_IMG]
  }, [product?.media])

  // reset active image for new product
  useEffect(() => {
    setActiveImage(0)
    // ensure first thumbnail visible after product change
    setTimeout(() => {
      const node = thumbsRef.current?.children?.[0] as HTMLElement | undefined
      node?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }, 80)
  }, [product?.id])

  // keyboard navigation for images
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        const ni = Math.max(0, activeImage - 1)
        setActiveImage(ni)
        const node = thumbsRef.current?.children?.[ni] as HTMLElement | undefined
        node?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      }
      if (e.key === 'ArrowRight') {
        const ni = Math.min(images.length - 1, activeImage + 1)
        setActiveImage(ni)
        const node = thumbsRef.current?.children?.[ni] as HTMLElement | undefined
        node?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeImage, images.length])

  const prevImage = () => {
    const ni = Math.max(0, activeImage - 1)
    setActiveImage(ni)
    const node = thumbsRef.current?.children?.[ni] as HTMLElement | undefined
    node?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }
  const nextImage = () => {
    const ni = Math.min(images.length - 1, activeImage + 1)
    setActiveImage(ni)
    const node = thumbsRef.current?.children?.[ni] as HTMLElement | undefined
    node?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }

  // touch handlers for main image
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

  // helper to activate thumbnail & scroll it into view
  const goToIndex = (idx: number) => {
    const index = Math.max(0, Math.min(images.length - 1, idx))
    setActiveImage(index)
    const node = thumbsRef.current?.children?.[index] as HTMLElement | undefined
    node?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }

  // ------------ NEW: подготовка строк спецификаций ------------
  // превращаем product.specifications в одномерный массив строк,
  // потом считаем фон только по атрибутам (headers не влияют на счётчик)
  const specRows = useMemo(() => {
    const rows: Array<{ type: 'header' | 'attr'; name: string; value?: string }> = []
    if (!product?.specifications || product.specifications.length === 0) return rows

    product.specifications.forEach((item: any) => {
      if ('isHeader' in item && item.isHeader) {
        rows.push({ type: 'header', name: item.name })
      } else {
        item.attributes?.forEach((atr: any) => {
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
      // header bg (distinct)
      return { ...row, bg: 'bg-[#E6EDF5]' }
    })
  }, [specRows])
  // -----------------------------------------------------------

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
          <Link to="/catalog" className="bg-[#F05023] text-white px-6 py-2 rounded hover:bg-[#d64018] transition">
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
          {/* LEFT: images */}
          <div>
            <div
              className="rounded-lg overflow-hidden mb-4 flex relative bg-white border border-gray-100 aspect-[4/3] items-center justify-center"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* main image (no arrows here now) */}
              <img
                src={images[activeImage] || PLACEHOLDER_IMG}
                alt={product.name || 'product image'}
                className="object-contain w-full h-full max-h-[520px]"
              />

              {product.discountPercent && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 text-sm font-bold rounded">
                  -{product.discountPercent}%
                </div>
              )}
            </div>

            {/* thumbnails row with arrows outside main image */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => goToIndex(activeImage - 1)}
                aria-label="Previous thumbnail"
                className={`p-2 rounded-full bg-white/90 hover:bg-white shadow transition ${activeImage === 0 ? 'opacity-40 pointer-events-none' : ''
                  }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className="w-full max-w-[720px] flex justify-center">
                <div
                  ref={thumbsRef}
                  className="flex gap-3 overflow-x-auto px-2 py-1 scrollbar-thin"
                >
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToIndex(idx)}
                      className={`
                        flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 focus:outline-none
                        ${activeImage === idx
                          ? 'border-[#F05023] ring-2 ring-[#F05023] scale-105'
                          : 'border-transparent hover:border-gray-300'}
                      `}
                      aria-label={`Показать изображение ${idx + 1}`}
                    >
                      <img src={img} alt={`${product.name}-${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => goToIndex(activeImage + 1)}
                aria-label="Next thumbnail"
                className={`p-2 rounded-full bg-white/90 hover:bg-white shadow transition ${activeImage === images.length - 1 ? 'opacity-40 pointer-events-none' : ''
                  }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 6L15 12L9 18" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* RIGHT: info */}
          <div>
            <div>
              <div className="flex flex-col sm:flex-row border-b gap-5 border-gray-100 pb-6">
                <div className='bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm w-full sm:w-2/3'>
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
                        {t("productPage.have")} {product.stockQuantity > 0 && `(${product.stockQuantity} шт.)`}
                      </span>
                    ) : (
                      <span className="text-gray-500 text-sm font-medium flex items-center gap-1 mb-5">
                        {t("productPage.haveNot")}
                      </span>
                    )}
                  </div>
                  <button
                    disabled={!product.inStock}
                    className={`w-full px-10 py-3 text-white font-bold uppercase transition shadow-md 
                      ${product.inStock ? 'bg-[#F05023] hover:bg-[#d64018] hover:shadow-lg' : 'bg-gray-400 cursor-not-allowed'}`}
                  >
                    {product.inStock ? t('productPage.buy') : t('productPage.notify')}
                  </button>
                </div>

                {/* компактный блок с парой ключевых спецификаций (показываем первые 4 атрибута, если есть) */}
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
                <div className="p-4 bg-gray-50 rounded text-sm text-gray-600">
                  <h5 className="text-[#EA571E] font-bold mb-1 text-xs uppercase">{t('productPage.conditionsReturn')}</h5>
                  <div className='flex justify-between flex-wrap gap-2'>
                    <p>
                      {t('productPage.conditions')}
                    </p>
                    <a href="#" className="font-bold hover:underline whitespace-nowrap">{t('productPage.more')} →</a>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-bold text-gray-500 uppercase mt-4">
                  <div className="flex items-center gap-2 mb-4 text-[#EA571E]">
                    <span className="text-[#F05023]"><img src={track} alt="" className="w-4 h-4" /></span> {t('productPage.delive')}
                  </div>
                  <div className="flex items-center gap-2 mb-4 text-[#EA571E]">
                    <span className="text-[#F05023]"><img src={delivery} alt="" className="w-4 h-4" /></span> {t('productPage.pay')}
                  </div>
                  <div className="flex items-center gap-2 mb-4 text-[#EA571E]">
                    <span className="text-[#F05023]"><img src={calendar} alt="" className="w-4 h-4" /></span> {t('productPage.work')}
                  </div>
                  <div className="flex items-center gap-2 mb-4 text-[#EA571E]">
                    <span className="text-[#F05023]"><img src={address} alt="" className="w-4 h-4" /></span> {t('productPage.adress')}
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
              className={`pb-4 px-2 font-bold uppercase text-sm transition whitespace-nowrap border-b-2 
                  ${activeTab === 'desc' ? 'border-[#F05023] text-[#F05023]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              {t('productPage.descriprion')}
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-4 px-2 font-bold uppercase text-sm transition whitespace-nowrap border-b-2 
                  ${activeTab === 'specs' ? 'border-[#F05023] text-[#F05023]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              {t('productPage.certificate')}
            </button>
            <button
              onClick={() => setActiveTab('order')}
              className={`pb-4 px-2 font-bold uppercase text-sm transition whitespace-nowrap border-b-2 
                  ${activeTab === 'order' ? 'border-[#F05023] text-[#F05023]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              {t('productPage.information')}
            </button>
          </div>
        </div>

        {activeTab === 'desc' && (
          <div className="animate-fade-in text-gray-800">
            <div className="mb-8">
              <div
                className="prose max-w-none text-sm leading-relaxed text-gray-700"
                dangerouslySetInnerHTML={{ __html: product.description || '' }}
              />
            </div>

            {product.variants && product.variants.length > 0 && (
              <div className="mt-12 overflow-x-auto">
                <h4 className="font-bold uppercase mb-4 text-sm tracking-wide text-gray-800">Модельный ряд:</h4>
                <table className="w-full min-w-[900px] border-collapse text-[13px] text-center border border-gray-300">
                  <thead>
                    <tr className="bg-white text-gray-800 font-bold border-b border-gray-300">
                      <th className="p-3 border-r border-gray-300 text-left w-[180px]">Модель / SKU</th>
                      <th className="p-3 border-r border-gray-300">Цена</th>
                      {Object.keys(product.variants[0].attributes).map(attrName => (
                        <th key={attrName} className="p-3 border-r border-gray-300 capitalize">{attrName}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((variant: any) => (
                      <tr key={variant.id} className="border-b border-gray-300 last:border-0 hover:bg-gray-50">
                        <td className="p-3 border-r border-gray-300 text-left align-top">
                          <div className="text-[#F05023] font-bold leading-tight">{variant.name}</div>
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
                {product.specifications.map((item: any, blockIdx: number) => {
                  if ('isHeader' in item && item.isHeader) {
                    return (
                      <div key={`header-${blockIdx}`} className="md:col-span-2 bg-[#E6EDF5] px-4 py-3 rounded">
                        <div className="font-bold text-xs uppercase text-gray-800">• {item.name}</div>
                      </div>
                    )
                  }

                  const mainIsGray = blockIdx % 2 === 0
                  const mainBg = mainIsGray ? 'bg-[#F5F7FA]' : 'bg-white'

                  return (
                    <div
                      key={`block-${blockIdx}`}
                      className={`${mainBg} self-start rounded-md border border-gray-100 overflow-hidden shadow-sm`}
                    >
                      {item.name && (
                        <div className={`${mainBg} px-4 py-3 border-b border-gray-100`}>
                          <div className="font-semibold text-gray-800">{item.name}</div>
                        </div>
                      )}
                      <div>
                        {item.attributes?.map((atr: any, aIdx: number) => {
                          const childIsGray = mainIsGray ? (aIdx % 2 === 1) : (aIdx % 2 === 0)
                          const childBg = childIsGray ? 'bg-[#F5F7FA]' : 'bg-white'

                          return (
                            <div
                              key={`atr-${blockIdx}-${aIdx}`}
                              className={`${childBg} px-4 py-3 flex justify-between items-start border-b border-gray-100`}
                            >
                              <div className="text-gray-600">• {atr.name}</div>
                              <div className="font-medium text-gray-900 text-right max-w-[60%] whitespace-pre-wrap">
                                {atr.value ?? '—'}
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
              <p className="py-4 text-gray-500">Характеристики не указаны</p>
            )}
          </div>
        )}
        {activeTab === 'order' && (
          <div className="animate-fade-in text-gray-800 py-4">
            <p className="mb-4">Для оформления заказа свяжитесь с нашими менеджерами:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>По телефону: <a href="tel:+77777777777" className="text-[#F05023] font-bold">+7 (777) 777-77-77</a></li>
              <li>По электронной почте: <a href="mailto:sales@example.com" className="text-[#F05023] font-bold">sales@example.com</a></li>
            </ul>
            <p className="mt-4 text-sm text-gray-500">
              Укажите артикул товара: <span className="font-bold text-gray-900">{product.sku}</span>
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
              <Contact />
            </div>
            <div className="flex justify-center md:justify-end px-2 md:px-0">
              <img src={sampleImg} alt="machine" className="max-w-full w-72 sm:w-full object-contain" />
            </div>
          </div>
        </section>
      </div>
    </PageContainer>
  )
}

export default ProductPage
