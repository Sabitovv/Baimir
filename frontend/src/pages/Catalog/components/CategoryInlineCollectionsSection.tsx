import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ProductCarousel from '@/components/collections/ProductCarousel'
import { useProductCollectionPlacement } from '@/features/productCollections/useProductCollectionPlacement'
import type { CollectionProduct } from '@/api/productCollectionsApi'

type CategoryInlineCollectionsSectionProps = {
  sectionTitle?: string
}

const CategoryInlineCollectionsSection = ({
  sectionTitle,
}: CategoryInlineCollectionsSectionProps) => {
  const { i18n } = useTranslation()
  const navigate = useNavigate()

  const { collections } = useProductCollectionPlacement(
    'CATEGORY_INLINE_COLLECTION',
    { lang: i18n.language, maxItems: 12 },
  )

  const visibleCollections = useMemo(
    () => collections.filter((collection) => collection.products.length > 0),
    [collections],
  )

  if (visibleCollections.length === 0) {
    return null
  }

  return (
    <section className={`${sectionTitle ? 'mt-8 sm:mt-10 md:mt-12' : ''} mb-6 sm:mb-8 md:mb-10`}>
      {sectionTitle && (
        <div className='mb-5 sm:mb-6 md:mb-7 px-1 sm:px-2'>
          <h2 className='font-oswald text-base sm:text-3xl md:text-[34px] lg:text-4xl xl:text-5xl font-bold uppercase text-gray-900'>
            {sectionTitle}
          </h2>
          <div className='mt-2 h-1 w-20 sm:w-24 md:w-24 lg:w-28 rounded-full bg-[#F58322]' />
        </div>
      )}

      <div className='space-y-5 sm:space-y-6 md:space-y-7'>
        {visibleCollections.map((collection) => (
          <section
            key={collection.id}
            className='-mx-4 sm:mx-0 rounded-none sm:rounded-2xl border-y sm:border border-[#E9EDF2] bg-gradient-to-b from-[#FFFFFF] via-[#FBFCFD] to-[#F7F9FB] p-4 shadow-[0_8px_24px_rgba(17,24,39,0.05)] sm:p-6 lg:p-7'
          >
            <div className='mb-2.5 flex items-start justify-between gap-2 border-b border-[#EEF1F4] pb-2 sm:mb-4 sm:items-end sm:gap-3 sm:pb-3'>
              <h3 className='text-base font-extrabold leading-tight text-gray-900 sm:text-2xl lg:text-[30px]'>
                {collection.name}
              </h3>
              <button
                type='button'
                onClick={() => navigate(`/collections/${collection.slug}`)}
                className='shrink-0 rounded-full border border-[#F58322] bg-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.06em] text-[#DB741F] transition hover:bg-[#FFF4EA] sm:px-4 sm:py-1.5 sm:text-xs'
              >
                Смотреть все
              </button>
            </div>

            <ProductCarousel
              products={collection.products as CollectionProduct[]}
              className='w-full'
              cardVariant='compact'
              enableMouseDrag
            />
          </section>
        ))}
      </div>
    </section>
  )
}

export default CategoryInlineCollectionsSection
