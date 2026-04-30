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
    <section className='mt-10 mb-12 sm:mt-14 sm:mb-16 md:mt-16 md:mb-20'>
      <div className='mb-5 sm:mb-6 md:mb-7 px-1 sm:px-2'>
        <h2 className='font-oswald text-base sm:text-3xl md:text-[34px] lg:text-4xl xl:text-5xl font-bold uppercase text-gray-900'>
          {t('catalogPage.recentlyViewed')}
        </h2>
        <div className='mt-2 h-1 w-20 sm:w-24 md:w-24 lg:w-28 rounded-full bg-[#F58322]' />
      </div>

      <div className='flex items-center gap-1 sm:gap-2.5 md:gap-2 lg:gap-3 w-full'>
        <button
          aria-label='scroll left'
          onClick={scrollLeft}
          className='hidden sm:flex shrink-0 p-3 z-10 items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer rounded-full border border-[#E6EAF0] bg-white shadow-sm'
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
          className='flex-1 flex gap-3 sm:gap-3 md:gap-2.5 lg:gap-3 overflow-x-auto py-2 px-0 sm:px-1 scroll-smooth snap-x snap-mandatory
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
                className='snap-center shrink-0 w-[calc((100%-1.5rem)/2.5)] min-w-[136px] max-w-[176px] sm:w-52 sm:min-w-0 sm:max-w-none md:w-56 lg:w-60 xl:w-64'
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
                />
              </div>
            ))
          )}
        </div>

        <button
          aria-label='scroll right'
          onClick={scrollRight}
          className='hidden sm:flex shrink-0 p-3 items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer rounded-full border border-[#E6EAF0] bg-white shadow-sm'
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
