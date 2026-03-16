import RightIcon from '@/assets/catalog/right.svg'
import LeftIcon from '@/assets/catalog/left.svg'
import { useTranslation } from 'react-i18next'
import { useRef, useEffect } from 'react'
import ProductCard from '@/components/common/ProductCard'
import { useGetPopularProductsQuery } from '@/api/productsApi'
import type { Product } from '@/api/productsApi'


export const PopularProduct = () => {
  const { t } = useTranslation()
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  const { data, isLoading, error } = useGetPopularProductsQuery({})
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

  const products = data?.content ?? []

  return (
    <section className="mb-24 mt-12 px-2 sm:px-0">
      <h2 className="font-oswald text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold uppercase mb-6 ml-2 sm:ml-4">
        {t('catalogPage.popular')}
      </h2>

      <div className="flex items-center gap-1 sm:gap-3 w-full">
        <button
          aria-label="scroll left"
          onClick={scrollLeft}
          className="shrink-0 p-1 sm:p-3 z-10 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        >
          <img src={LeftIcon} alt="Left" className="w-6 h-6 sm:w-10 sm:h-10" />
        </button>

        <div
          ref={scrollerRef}
          role="list"
          tabIndex={0}
          onKeyDown={handleKey}
          className="flex-1 flex gap-3 sm:gap-4 overflow-x-auto py-2 px-1 scroll-smooth snap-x snap-mandatory
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {isLoading ? (
            <div className="text-gray-500 px-4">{t('commonCatalog.loading')}</div>
          ) : error ? (
            <div className="text-red-500 px-4">{t('commonCatalog.error')}</div>
          ) : products.length === 0 ? (
            <div className="text-gray-500 px-4">{t('catalogPage.noPopularProducts')}</div>
          ) : (
            products.map((product: Product) => (
              <div
                key={product.id}
                role="listitem"
                className="snap-center shrink-0 w-[260px] xs:w-[280px] sm:w-64 md:w-72 lg:w-80"
              >
                <ProductCard
                  id={product.id}
                  slug={product.slug}
                  name={product.name}
                  coverImage={product.coverImage}
                  price={product.price}
                  oldPrice={product.oldPrice}
                  inStock={product.inStock}
                />
              </div>
            ))
          )}
        </div>

        <button
          aria-label="scroll right"
          onClick={scrollRight}
          className="shrink-0 p-1 sm:p-3 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        >
          <img src={RightIcon} alt="Right" className="w-6 h-6 sm:w-10 sm:h-10" />
        </button>
      </div>
    </section>
  )
}
