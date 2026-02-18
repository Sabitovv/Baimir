import RightIcon from '@/assets/Catalog/right.svg'
import LeftIcon from '@/assets/Catalog/left.svg'
import { useTranslation } from 'react-i18next'
import { useRef, useEffect } from 'react'
import ProductCard from '@/components/common/ProductCard'
import prodImg from '@/assets/catalog/prod_sample.png'

export const PopularProduct = () => {
  const { t } = useTranslation()
  const scrollerRef = useRef<HTMLDivElement | null>(null)

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

  const products = Array.from({ length: 8 }).map((_, i) => ({
    id: i + 1,
    title: `Лазерный станок модель ${i + 1}`,
    price: '10 500 000 ₸',
    image: prodImg,
  }))

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    el.style.setProperty('-webkit-overflow-scrolling', 'touch')
  }, [])

  return (
    <section className="mb-24 mt-12 px-2 sm:px-0">
      <h2 className="font-oswald text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold uppercase mb-6 ml-2 sm:ml-4">
        {t('catalogPage.popular')}
      </h2>

      {/* Контейнер: flex с gap, чтобы стрелки были по краям от списка */}
      <div className="flex items-center gap-1 sm:gap-3 w-full">

        {/* Левая стрелка: shrink-0 не дает ей исчезнуть */}
        <button
          aria-label="scroll left"
          onClick={scrollLeft}
          className="
            shrink-0 
            p-1 sm:p-3 
            z-10 flex items-center justify-center 
            hover:scale-105 active:scale-95 transition-transform cursor-pointer
          "
        >
          {/* Иконка меняет размер: w-6 на мобильном, w-10 на десктопе */}
          <img src={LeftIcon} alt="Left" className="w-6 h-6 sm:w-10 sm:h-10" />
        </button>

        {/* Скролл-контейнер */}
        <div
          ref={scrollerRef}
          role="list"
          tabIndex={0}
          onKeyDown={handleKey}
          className="
            flex-1 
            flex gap-3 sm:gap-4 
            overflow-x-auto 
            py-2 px-1 
            scroll-smooth snap-x snap-mandatory
            [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
          "
        >
          {products.map((p) => (
            <div
              key={p.id}
              role="listitem"
              className="
                snap-center shrink-0
                /* На мобильном карточка занимает почти всю ширину между стрелками */
                w-[260px] xs:w-[280px] sm:w-64 md:w-72 lg:w-80
              "
            >
              <ProductCard title={p.title} price={p.price} image={p.image} />
            </div>
          ))}
        </div>

        {/* Правая стрелка */}
        <button
          aria-label="scroll right"
          onClick={scrollRight}
          className="
            shrink-0 
            p-1 sm:p-3 
            flex items-center justify-center 
            hover:scale-105 active:scale-95 transition-transform cursor-pointer
          "
        >
          <img src={RightIcon} alt="Right" className="w-6 h-6 sm:w-10 sm:h-10" />
        </button>
      </div>
    </section>
  )
}