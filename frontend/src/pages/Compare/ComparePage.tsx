import { Link } from 'react-router-dom'
import { skipToken } from '@reduxjs/toolkit/query'
import { useTranslation } from 'react-i18next'
import PageContainer from '@/components/ui/PageContainer'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { clearCompare, removeFromCompare } from '@/features/compareSlice'
import { useGetProductsCompareQuery } from '@/api/productsApi'

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-KZ', {
    style: 'currency',
    currency: 'KZT',
    maximumFractionDigits: 0,
  }).format(price)
}

const ComparePage = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const compareItems = useAppSelector((state) => state.compare.items)

  const compareIds = compareItems.map((item) => item.id)
  const { data, isLoading, isError } = useGetProductsCompareQuery(compareIds.length > 0 ? compareIds : skipToken)

  const compareGroup = data?.[0]
  const products = compareGroup?.products ?? []
  const attributes = compareGroup?.attributes ?? []

  if (compareItems.length === 0) {
    return (
      <PageContainer>
        <section className="mx-auto max-w-7xl px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-900">{t('compare.title')}</h1>
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-gray-800">{t('compare.emptyTitle')}</p>
            <p className="mt-2 text-gray-500">{t('compare.emptyDescription')}</p>
            <Link
              to="/catalog"
              className="mt-5 inline-flex rounded-xl bg-[#F58322] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#DB741F]"
            >
              {t('compare.goToCatalog')}
            </Link>
          </div>
        </section>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('compare.title')}</h1>
            <p className="mt-2 text-sm text-gray-500">
              {compareGroup?.categoryName || compareItems[0]?.categoryName}
            </p>
          </div>
          <button
            type="button"
            onClick={() => dispatch(clearCompare())}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-[#F58322] hover:text-[#DB741F]"
          >
            {t('compare.clear')}
          </button>
        </div>

        {isLoading && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500">
            {t('compare.loading')}
          </div>
        )}

        {isError && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-600">
            {t('compare.error')}
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <article key={product.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <img
                    src={product.coverImage || 'https://placehold.co/600x400?text=No+Image'}
                    alt={t('compare.productImageAlt', { name: product.name })}
                    className="h-40 w-full rounded-xl object-cover"
                  />
                  <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-gray-900">{product.name}</h3>
                  <p className="mt-1 text-sm font-bold text-[#F58322]">{formatPrice(product.price)}</p>
                  <button
                    type="button"
                    onClick={() => dispatch(removeFromCompare(product.id))}
                    className="mt-3 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:border-[#F58322] hover:text-[#DB741F]"
                  >
                    {t('compare.remove')}
                  </button>
                </article>
              ))}
            </div>

            <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="sticky left-0 z-10 border-b border-r border-gray-200 bg-gray-50 px-4 py-3 text-left font-semibold text-gray-700">
                      {t('compare.attribute')}
                    </th>
                    {products.map((product) => (
                      <th key={`head-${product.id}`} className="border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700">
                        {product.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attributes.map((attribute, idx) => (
                    <tr key={`${attribute.attributeName}-${idx}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                      <td className="sticky left-0 z-10 border-r border-gray-200 bg-inherit px-4 py-3 font-medium text-gray-700">
                        {attribute.attributeName}
                      </td>
                      {products.map((product) => (
                        <td key={`${attribute.attributeName}-${product.id}`} className="px-4 py-3 text-gray-700">
                          {attribute.values[String(product.id)] || t('compare.noValue')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </PageContainer>
  )
}

export default ComparePage
