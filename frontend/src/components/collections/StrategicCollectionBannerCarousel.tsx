import { useEffect, useMemo, useState, type FC } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useProductCollectionPlacement } from '@/features/productCollections/useProductCollectionPlacement'
import type { ResolvedPlacementCollection } from '@/api/productCollectionsApi'
import productPlaceholder from '@/assets/catalog/productPlaceholder.svg'

type StrategicCollectionBannerCarouselProps = {
  className?: string
  autoRotateMs?: number
}

const formatPromoDate = (value: string | null | undefined, locale: string) => {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
  }).format(parsed)
}

const StrategicCollectionBannerCarousel: FC<StrategicCollectionBannerCarouselProps> = ({
  className,
  autoRotateMs = 4500,
}) => {
  const { i18n } = useTranslation()
  const [activeIndex, setActiveIndex] = useState(0)
  const [activeProductIndex, setActiveProductIndex] = useState(0)

  const { collections, isLoading, isFetching, isError } =
    useProductCollectionPlacement('CATALOG_TOP_STRATEGIC_COLLECTION', {
      lang: i18n.language,
      maxItems: 12,
    })

  const visibleCollections = useMemo(
    () => collections.filter((collection) => collection.products.length > 0),
    [collections],
  )

  useEffect(() => {
    if (activeIndex < visibleCollections.length) return
    setActiveIndex(0)
  }, [activeIndex, visibleCollections.length])

  const activeCollection = visibleCollections[activeIndex]
  const products = activeCollection?.products ?? []
  const safeProductIndex =
    activeProductIndex < products.length ? activeProductIndex : 0
  const coverProduct = products[safeProductIndex] ?? null

  useEffect(() => {
    setActiveProductIndex(0)
  }, [activeIndex])

  useEffect(() => {
    if (products.length <= 1) return

    const timer = window.setInterval(() => {
      setActiveProductIndex((prev) => (prev + 1) % products.length)
    }, autoRotateMs)

    return () => window.clearInterval(timer)
  }, [products.length, autoRotateMs, activeCollection?.id])

  if (
    isLoading ||
    isFetching ||
    isError ||
    visibleCollections.length === 0 ||
    !activeCollection ||
    !coverProduct
  ) {
    return null
  }

  const startLabel = formatPromoDate(activeCollection.startDate, i18n.language)
  const endLabel = formatPromoDate(activeCollection.endDate, i18n.language)

  const periodLabel =
    startLabel && endLabel
      ? `${startLabel} - ${endLabel}`
      : startLabel
        ? `с ${startLabel}`
        : endLabel
          ? `до ${endLabel}`
          : null

  return (
    <section
      className={`relative overflow-hidden rounded-xl border border-[#E5E7EB] bg-gradient-to-r from-[#111827] via-[#1F2937] to-[#0F172A] p-3 text-white sm:p-4 ${className ?? ''}`}
    >
      <img
        src={coverProduct.coverImage || productPlaceholder}
        alt=''
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30 blur-[2px]'
      />
      <div className='pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0B1220]/92 via-[#111827]/80 to-[#0F172A]/92' />
      <div className='pointer-events-none absolute -right-10 -top-8 h-28 w-28 rounded-full bg-[#F58322]/20 blur-2xl' />

      <div className='relative sm:hidden'>
        <p className='mb-1 inline-flex rounded-full border border-[#FDBA74]/45 bg-[#FDBA74]/12 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#FCD9A5]'>
          Стратегическая подборка
        </p>
        <h3 className='line-clamp-1 text-xs font-bold text-white/90'>
          {activeCollection.name}
        </h3>
        {periodLabel && (
          <p className='mt-1 inline-flex rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[9px] font-semibold text-[#FDE7C3]'>
            Акция {periodLabel}
          </p>
        )}

        <div className='mt-2.5 flex items-center gap-2'>
          <div className='relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-xl border border-white/25 bg-white/10 p-1.5'>
            <img
              src={coverProduct.coverImage || productPlaceholder}
              alt={coverProduct.name}
              className='h-full w-full rounded-lg object-contain'
              loading='lazy'
            />
          </div>
          <div className='min-w-0'>
            <p className='line-clamp-2 text-sm font-extrabold uppercase leading-tight text-white'>
              {coverProduct.name}
            </p>
            <p className='mt-1 text-sm font-extrabold text-white'>
              {new Intl.NumberFormat(i18n.language, {
                style: 'currency',
                currency: 'KZT',
                maximumFractionDigits: 0,
              }).format(coverProduct.price)}
            </p>
            <p
              className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                coverProduct.inStock
                  ? 'bg-emerald-500/25 text-emerald-200'
                  : 'bg-gray-500/30 text-gray-200'
              }`}
            >
              {coverProduct.inStock ? 'В наличии' : 'Нет в наличии'}
            </p>
          </div>
        </div>

        <Link
          to={`/catalog/product/${coverProduct.slug}`}
          className='mt-2.5 inline-flex rounded-full bg-[#F58322] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white transition hover:bg-[#DB741F]'
        >
          К товарам
        </Link>
      </div>

      <div className='relative hidden min-h-[150px] items-center gap-4 sm:grid xl:hidden sm:grid-cols-[1fr_1.1fr_auto]'>
        <div className='min-w-0'>
          <p className='mb-1.5 inline-flex rounded-full border border-[#FDBA74]/45 bg-[#FDBA74]/12 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#FCD9A5]'>
            Стратегическая подборка
          </p>
          <h3 className='line-clamp-2 text-sm font-extrabold leading-[1.2] text-white md:text-base'>
            {activeCollection.name}
          </h3>
          {periodLabel && (
            <p className='mt-1.5 inline-flex rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#FDE7C3]'>
              Акция {periodLabel}
            </p>
          )}
        </div>

        <div className='min-w-0 text-center'>
          <p className='line-clamp-2 text-xl font-extrabold uppercase leading-tight text-white md:text-2xl'>
            {coverProduct.name}
          </p>
          <Link
            to={`/catalog/product/${coverProduct.slug}`}
            className='mt-2 inline-flex rounded-full bg-[#F58322] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white transition hover:bg-[#DB741F] md:mt-2.5 md:px-3.5 md:py-1.5 md:text-xs'
          >
            К товарам
          </Link>
        </div>

        <div className='flex items-center justify-end gap-3'>
          <div className='text-right'>
            <p className='text-[10px] font-medium text-white/70'>Цена</p>
            <p className='text-base font-extrabold text-white md:text-lg'>
              {new Intl.NumberFormat(i18n.language, {
                style: 'currency',
                currency: 'KZT',
                maximumFractionDigits: 0,
              }).format(coverProduct.price)}
            </p>
            <p
              className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                coverProduct.inStock
                  ? 'bg-emerald-500/25 text-emerald-200'
                  : 'bg-gray-500/30 text-gray-200'
              }`}
            >
              {coverProduct.inStock ? 'В наличии' : 'Нет в наличии'}
            </p>
          </div>

          <div className='relative h-[124px] w-[124px] shrink-0 overflow-hidden rounded-2xl border border-white/25 bg-gradient-to-b from-white/20 to-white/5 p-2 shadow-[0_14px_34px_rgba(0,0,0,0.3)] backdrop-blur-sm md:h-[138px] md:w-[138px]'>
            <div className='pointer-events-none absolute inset-x-4 top-0 h-8 rounded-full bg-white/35 blur-md' />
            <img
              src={coverProduct.coverImage || productPlaceholder}
              alt={coverProduct.name}
              className='relative z-10 h-full w-full rounded-xl object-contain contrast-110 saturate-125'
              loading='lazy'
            />
          </div>
        </div>
      </div>

      <div className='relative hidden min-h-[172px] xl:block'>
        <div className='absolute left-0 top-1/2 z-20 max-w-[38%] -translate-y-1/2'>
          <p className='mb-2 inline-flex rounded-full border border-[#FDBA74]/45 bg-[#FDBA74]/12 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#FCD9A5] sm:mb-2.5 sm:px-3 sm:text-[11px]'>
            Стратегическая подборка
          </p>
          <h3 className='line-clamp-2 text-base font-extrabold leading-[1.2] text-white sm:text-[20px]'>
            {activeCollection.name}
          </h3>
          {periodLabel && (
            <p className='mt-2 inline-flex rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.02em] text-[#FDE7C3] sm:mt-2.5 sm:px-3 sm:text-xs'>
              Акция {periodLabel}
            </p>
          )}
        </div>

        <div className='mx-auto flex min-h-[140px] w-full max-w-[56%] items-center justify-center px-2 sm:min-h-[172px] sm:px-4'>
          <p className='line-clamp-2 max-w-[360px] text-center text-lg font-extrabold uppercase leading-tight text-white sm:max-w-[460px] sm:text-2xl'>
            {coverProduct.name}
          </p>
        </div>

        <div className='absolute right-0 top-1/2 z-20 flex -translate-y-1/2 items-center justify-end gap-3 sm:gap-4'>
          <div className='text-right'>
            <p className='text-[10px] font-medium text-white/70 sm:text-xs'>Цена</p>
            <p className='text-base font-extrabold text-white sm:text-lg'>
              {new Intl.NumberFormat(i18n.language, {
                style: 'currency',
                currency: 'KZT',
                maximumFractionDigits: 0,
              }).format(coverProduct.price)}
            </p>
            <p
              className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold sm:text-[10px] ${
                coverProduct.inStock
                  ? 'bg-emerald-500/25 text-emerald-200'
                  : 'bg-gray-500/30 text-gray-200'
              }`}
            >
              {coverProduct.inStock ? 'В наличии' : 'Нет в наличии'}
            </p>
          </div>

          <div className='relative h-[112px] w-[112px] shrink-0 overflow-hidden rounded-2xl border border-white/25 bg-gradient-to-b from-white/20 to-white/5 p-2 shadow-[0_14px_34px_rgba(0,0,0,0.3)] backdrop-blur-sm sm:h-[156px] sm:w-[156px]'>
            <div className='pointer-events-none absolute inset-x-4 top-0 h-8 rounded-full bg-white/35 blur-md' />
            <img
              src={coverProduct.coverImage || productPlaceholder}
              alt={coverProduct.name}
              className='relative z-10 h-full w-full rounded-xl object-contain contrast-110 saturate-125'
              loading='lazy'
            />
          </div>
        </div>

        <div className='absolute bottom-0 left-1/2 z-20 -translate-x-1/2'>
          <Link
            to={`/catalog/product/${coverProduct.slug}`}
            className='inline-flex rounded-full bg-[#F58322] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white transition hover:bg-[#DB741F] sm:px-3.5 sm:py-1.5 sm:text-xs'
          >
            К товарам
          </Link>
        </div>
      </div>

      {products.length > 1 && (
        <div className='relative mt-2.5 flex items-center gap-1.5 sm:mt-3'>
          {products.slice(0, 8).map((product, index) => (
            <button
              key={product.id}
              type='button'
              aria-label={`Показать товар ${index + 1}`}
              onClick={() => setActiveProductIndex(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === safeProductIndex
                  ? 'w-6 bg-[#FDE68A]'
                  : 'w-3 bg-white/35 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}

      {visibleCollections.length > 1 && (
        <div className='relative mt-2 flex items-center gap-1.5 sm:mt-3'>
          {visibleCollections.map((collection: ResolvedPlacementCollection, index) => (
            <button
              key={collection.id}
              type='button'
              aria-label={`Показать подборку ${index + 1}`}
              onClick={() => {
                setActiveIndex(index)
                setActiveProductIndex(0)
              }}
              className={`h-1.5 rounded-full transition-all ${
                index === activeIndex
                  ? 'w-6 bg-[#F58322]'
                  : 'w-3 bg-white/35 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default StrategicCollectionBannerCarousel
