import { useTranslation } from 'react-i18next'
import { useMemo, useState } from 'react'
import { useGetProductsBatchQuery } from '@/api/productsApi'
import type { ProductDetail } from '@/api/productsApi'
import { readRecentlyViewedProductIds } from '@/utils/recentlyViewedStorage'
import ProductCarousel from '@/components/collections/ProductCarousel'

export const RecentlyViewedProducts = () => {
  const { t } = useTranslation()
  const [recentIds] = useState<number[]>(() => readRecentlyViewedProductIds())

  const { data, isLoading, error } = useGetProductsBatchQuery(recentIds, {
    skip: recentIds.length === 0,
  })

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

      <div className='w-full'>
        {isLoading ? (
          <div className='text-gray-500 px-4'>{t('commonCatalog.loading')}</div>
        ) : error ? (
          <div className='text-red-500 px-4'>{t('commonCatalog.error')}</div>
        ) : (
          <ProductCarousel products={products as any} /> 
        )}
      </div>
    </section>
  )
}