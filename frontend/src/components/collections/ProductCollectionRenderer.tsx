import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
// ДОБАВЛЕН ИМПОРТ useNavigate
import { useNavigate } from 'react-router-dom' 
import { type CollectionPlacementType } from '@/api/productCollectionsApi'
import { useProductCollectionPlacement } from '@/features/productCollections/useProductCollectionPlacement'
import ProductCarousel from './ProductCarousel'
import ProductGrid from './ProductGrid'
import { CollectionError, CollectionSkeleton } from './CollectionStates'

type CollectionLayout = 'carousel' | 'grid'
type CollectionVariant = 'hero' | 'recommendations'

type ProductCollectionRendererProps = {
  placement: CollectionPlacementType
  layout?: CollectionLayout
  variant?: CollectionVariant
  title?: string
  maxItems?: number
  className?: string
  carouselCardVariant?: 'compact' | 'mini'
  skeletonCount?: number
  errorMessage?: string
}

const formatPromoDate = (value: string | null | undefined, locale: string) => {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

const ProductCollectionRenderer: FC<ProductCollectionRendererProps> = ({
  placement,
  layout = 'carousel',
  variant = 'hero',
  title,
  maxItems,
  className,
  carouselCardVariant,
  skeletonCount = 4,
  errorMessage,
}) => {
  const { i18n } = useTranslation()
  // ИНИЦИАЛИЗИРУЕМ НАВИГАЦИЮ
  const navigate = useNavigate()

  const {
    collections,
    isLoading,
    isFetching,
    isError,
  } = useProductCollectionPlacement(placement, {
    lang: i18n.language,
    maxItems,
  })

  const renderProducts = (products: typeof collections[number]['products']) => {
    if (layout === 'grid') {
      return <ProductGrid products={products} />
    }

    return (
      <ProductCarousel
        products={products}
        cardVariant={carouselCardVariant}
      />
    )
  }

  const visibleCollections = collections.filter(
    (collection) => collection.products.length > 0,
  )

  if (!isLoading && !isFetching && !isError && visibleCollections.length === 0) {
    return null
  }

  const isRecommendations = variant === 'recommendations'
  
  const sectionClassName = isRecommendations
    ? '-mx-4 sm:mx-0 rounded-none sm:rounded-xl border-y sm:border-x border-[#EEF1F4] bg-white p-3 sm:p-4'
    : '-mx-4 sm:mx-0 rounded-none sm:rounded-2xl border-y sm:border border-[#E9EDF2] bg-gradient-to-b from-[#FFFFFF] via-[#FBFCFD] to-[#F7F9FB] p-4 shadow-[0_8px_24px_rgba(17,24,39,0.05)] sm:p-6 lg:p-7'

  return (
    <section
      className={`${sectionClassName} ${className ?? ''}`}
      data-placement={placement}
    >
      {(isLoading || isFetching) && (
        <CollectionSkeleton count={skeletonCount} layout={layout} />
      )}

      {!isLoading && !isFetching && isError && (
        <CollectionError message={errorMessage} />
      )}

      {!isLoading && !isFetching && !isError && visibleCollections.length > 0 && (
        <>
          {isRecommendations ? (
            <div className='space-y-4 sm:space-y-5'>
              {visibleCollections.map((collection) => (
                <div key={collection.id}>
                  <div className='mb-2.5 border-b border-dashed border-[#E5EAF0] pb-2 sm:mb-3 sm:pb-2.5'>
                    <h2 className='text-sm font-extrabold leading-tight text-[#1F2937] sm:text-lg'>
                      {title ?? collection.name}
                    </h2>
                    <p className='mt-1 text-[11px] font-medium text-[#6B7280] sm:text-xs'>
                      Подборка товаров на основе интересов и популярных просмотров
                    </p>
                  </div>
                  {renderProducts(collection.products)}
                </div>
              ))}
            </div>
          ) : (
            <div className='space-y-6 sm:space-y-7'>
              {visibleCollections.map((collection) => (
                <div key={collection.id}>
                  {(title ?? collection.name) && (
                    <div className='mb-2.5 flex items-start justify-between gap-2 border-b border-[#EEF1F4] pb-2 sm:mb-4 sm:items-end sm:gap-3 sm:pb-3'>
                      <div className='min-w-0'>
                        <h2 className='text-base font-extrabold leading-tight text-gray-900 sm:text-2xl lg:text-[30px]'>
                          {title ?? collection.name}
                        </h2>
                        {(collection.startDate || collection.endDate) && (
                          <p className='mt-1.5 inline-flex max-w-full items-center rounded-full border border-[#FFD7B8] bg-[#FFF4EA] px-2 py-0.5 text-[9px] font-semibold text-[#B45309] sm:mt-2 sm:px-3 sm:py-1 sm:text-xs'>
                            {(() => {
                              const startLabel = formatPromoDate(collection.startDate, i18n.language)
                              const endLabel = formatPromoDate(collection.endDate, i18n.language)

                              if (startLabel && endLabel) return `Акция: ${startLabel} - ${endLabel}`
                              if (startLabel) return `Акция с ${startLabel}`
                              return `Акция до ${endLabel}`
                            })()}
                          </p>
                        )}
                      </div>
                      <button
                        type='button'
                        // ДОБАВЛЕН ОБРАБОТЧИК КЛИКА (перенаправляем на страницу коллекции)
                        onClick={() => navigate(`/collections/${collection.id}`)}
                        className='shrink-0 rounded-full border border-[#F58322] bg-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.06em] text-[#DB741F] transition hover:bg-[#FFF4EA] sm:px-4 sm:py-1.5 sm:text-xs'
                      >
                        Смотреть все
                      </button>
                    </div>
                  )}
                  {renderProducts(collection.products)}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default ProductCollectionRenderer