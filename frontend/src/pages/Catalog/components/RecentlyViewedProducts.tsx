import RightIcon from '@/assets/catalog/right.svg'
import LeftIcon from '@/assets/catalog/left.svg'
import ProductCard from '@/components/common/ProductCard'
import { useGetProductsBatchQuery } from '@/api/productsApi'
import type { ProductDetail } from '@/api/productsApi'
import { EditableImage } from '@/zustand/EditableImage'
import { useTranslation } from 'react-i18next'
import { useEffect, useMemo, useRef, useState } from 'react'
import { readRecentlyViewedProductIds } from '@/utils/recentlyViewedStorage'

export const RecentlyViewedProducts = () => {
  const { t } = useTranslation()
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const [recentIds] = useState<number[]>(() => readRecentlyViewedProductIds())

  const { data, isLoading, error } = useGetProductsBatchQuery(recentIds, {
    skip: recentIds.length === 0,
  })

  const SCROLL_STEP_PX = 320

  const scrollLeft = () => {
    scrollerRef.current?.scrollBy({
      left: -SCROLL_STEP_PX,
      behavior: 'smooth',
    })
  }

  const scrollRight = () => {
    scrollerRef.current?.scrollBy({
      left: SCROLL_STEP_PX,
      behavior: 'smooth',
    })
  }

  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      scrollLeft()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      scrollRight()
    }
  }

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    el.style.setProperty('-webkit-overflow-scrolling', 'touch')
  }, [])

  const products = useMemo(() => {
    if (!data || recentIds.length === 0) return []

    const productMap = new Map<number, ProductDetail>()
    data.forEach((product) => {
      productMap.set(product.id, product)
    })

    return recentIds
      .map((id) => productMap.get(id))
      .filter((product): product is ProductDetail => Boolean(product))
  }, [data, recentIds])

  if (recentIds.length === 0) return null
  if (!isLoading && !error && products.length === 0) return null

  return (
    <section className='mb-24 mt-12 px-2 sm:px-0'>
      <h2 className='font-oswald text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold uppercase mb-6 ml-2 sm:ml-4'>
        {t('catalogPage.recentlyViewed')}
      </h2>

      <div className='flex items-center gap-1 sm:gap-3 w-full'>
        <button
          aria-label='scroll left'
          onClick={scrollLeft}
          className='hidden sm:flex shrink-0 p-3 z-10 items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer'
        >
          <EditableImage
            imageKey='catalog_recently_viewed_arrow_left'
            fallbackSrc={LeftIcon}
            alt='Left'
            className='w-6 h-6 sm:w-10 sm:h-10'
          />
        </button>

        <div
          ref={scrollerRef}
          role='list'
          tabIndex={0}
          onKeyDown={handleKey}
          className='flex-1 flex gap-3 sm:gap-4 overflow-x-auto py-2 px-1 scroll-smooth snap-x snap-mandatory
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'
        >
          {isLoading ? (
            <div className='text-gray-500 px-4'>{t('commonCatalog.loading')}</div>
          ) : error ? (
            <div className='text-red-500 px-4'>{t('commonCatalog.error')}</div>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                role='listitem'
                className='snap-center shrink-0 w-[260px] xs:w-[280px] sm:w-64 md:w-72 lg:w-80'
              >
                <ProductCard
                  id={product.id}
                  slug={product.slug}
                  name={product.name}
                  coverImage={product.coverImage}
                  price={product.price}
                  oldPrice={product.oldPrice}
                  inStock={product.inStock}
                  isNew={product.newProduct ?? product.new}
                  categoryId={product.category?.id}
                  categoryName={product.category?.name}
                  showCompare={false}
                />
              </div>
            ))
          )}
        </div>

        <button
          aria-label='scroll right'
          onClick={scrollRight}
          className='hidden sm:flex shrink-0 p-3 items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer'
        >
          <EditableImage
            imageKey='catalog_recently_viewed_arrow_right'
            fallbackSrc={RightIcon}
            alt='Right'
            className='w-6 h-6 sm:w-10 sm:h-10'
          />
        </button>
      </div>
    </section>
  )
}
