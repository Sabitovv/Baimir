import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppDispatch } from '@/app/hooks'
import { setBreadcrumbs } from '@/features/catalogSlice'
import { useGetProductCollectionBySlugQuery } from '@/api/productCollectionsApi'
import PageContainer from '@/components/ui/PageContainer'
import Breadcrumbs from '@/pages/Catalog/components/Breadcrumbs'
import CategoriesMenu from '@/components/common/CategoriesMenu'
import ProductCard from '@/components/common/ProductCard'
import ProductCollectionRenderer from '@/components/collections/ProductCollectionRenderer'

const CollectionPage = () => {
  const { slug = '' } = useParams<{ slug: string }>()
  const { t, i18n } = useTranslation()
  const dispatch = useAppDispatch()

  const {
    data: collection,
    isLoading,
    isError,
  } = useGetProductCollectionBySlugQuery({ slug, lang: i18n.language }, { skip: !slug })

  useEffect(() => {
    if (!collection) return

    dispatch(
      setBreadcrumbs([
        { name: t('commonCatalog.catalog'), path: '/catalog' },
        { name: collection.name, path: `/collections/${collection.slug}` },
      ]),
    )
  }, [collection, dispatch, t])

  return (
    <PageContainer>
      <div className='px-4 md:px-5 lg:px-0 mb-12 sm:mb-16 md:mb-20'>
        <div className='my-4 sm:my-5'>
          <h1 className='font-manrope text-[22px] leading-tight sm:text-3xl md:text-[34px] lg:text-4xl xl:text-5xl font-bold uppercase text-gray-900'>
            {collection?.name ?? t('commonCatalog.catalog')}
          </h1>
          <Breadcrumbs />
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[260px_1fr] gap-6 md:gap-7 lg:gap-8 mt-4'>
          <aside className='hidden lg:block space-y-2 pr-4'>
            <CategoriesMenu />
          </aside>

          <main>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5 md:gap-3.5 lg:gap-4'>
              {isLoading && (
                <p className='col-span-full text-center'>
                  {t('productPage.loadingProduct')}
                </p>
              )}

              {!isLoading && isError && (
                <p className='col-span-full text-center text-gray-500'>
                  {t('categoryPage.errorCategories')}
                </p>
              )}

              {!isLoading && !isError && (collection?.products?.length ?? 0) === 0 && (
                <div className='col-span-full py-8'>
                  <p className='text-center text-gray-500 pb-5'>
                    {t('productPage.notFoundTitle')}
                  </p>
                  <p className='text-center text-sm sm:text-base font-semibold text-gray-900 pb-4'>
                    {t('common.maybeInterested')}
                  </p>
                  <ProductCollectionRenderer
                    placement='SEARCH_EMPTY_STATE_COLLECTION'
                    layout='carousel'
                    variant='recommendations'
                    maxItems={8}
                  />
                </div>
              )}

              {(collection?.products ?? []).map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  slug={product.slug}
                  name={product.name}
                  coverImage={product.coverImage}
                  price={product.price}
                  oldPrice={product.oldPrice}
                  inStock={product.inStock}
                  isNew={product.newProduct}
                  categoryName={product.categoryName ?? ''}
                />
              ))}
            </div>
          </main>
        </div>
      </div>
    </PageContainer>
  )
}

export default CollectionPage
