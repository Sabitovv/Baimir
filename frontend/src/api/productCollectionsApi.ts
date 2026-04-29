import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import i18n from 'i18next'

export type CollectionPlacementType =
  | 'HOME_HERO_COLLECTION'
  | 'HOME_PERSONALIZED_RECOMMENDATIONS'
  | 'CATALOG_TOP_STRATEGIC_COLLECTION'
  | 'CATEGORY_INLINE_COLLECTION'
  | 'PRODUCT_RELATED_COLLECTION'
  | 'PRODUCT_ALTERNATIVES_COLLECTION'
  | 'CART_CROSS_SELL_COLLECTION'
  | 'CHECKOUT_TRUSTED_ADDONS_COLLECTION'
  | 'POST_PURCHASE_NEXT_BUY_COLLECTION'
  | 'SEARCH_EMPTY_STATE_COLLECTION'

export type ProductCollection = {
  id: number
  name: string
  slug: string
  placements: CollectionPlacementType[]
  sortOrder: number
  startDate: string | null
  endDate: string | null
}

export type CollectionProduct = {
  id: number
  slug: string
  sku: string
  name: string
  brandName: string | null
  categoryName: string | null
  coverImage: string | null
  price: number
  oldPrice: number | null
  discountPercent: number | null
  inStock: boolean
  hasVariants: boolean
  reviewsCount: number
  keyFeatures: unknown[] | null
  medias: unknown[] | null
  newProduct: boolean
  hasProduct: boolean
}

export type ProductCollectionWithProducts = ProductCollection & {
  products: CollectionProduct[]
}

export type ProductCollectionBySlug = {
  slug: string
  name: string
  startDate: string | null
  endDate: string | null
  products: CollectionProduct[]
}

export type ResolvedPlacementCollection = ProductCollection & {
  products: CollectionProduct[]
}

export const productCollectionsApi = createApi({
  reducerPath: 'productCollectionsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers) => {
      const lang = i18n.language || 'ru'
      headers.set('Accept-Language', lang)
      return headers
    },
  }),
  tagTypes: ['ProductCollection'],
  endpoints: (builder) => ({
    getProductCollections: builder.query<ProductCollection[], { lang?: string } | void>({
      query: (arg) => {
        const lang = (arg as { lang?: string })?.lang
        return {
          url: '/collections',
          headers: lang ? { 'Accept-Language': lang } : undefined,
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'ProductCollection' as const, id: item.id })),
              { type: 'ProductCollection' as const, id: 'LIST' },
            ]
          : [{ type: 'ProductCollection' as const, id: 'LIST' }],
    }),
    getProductCollectionBySlug: builder.query<
      ProductCollectionBySlug,
      { slug: string; lang?: string }
    >({
      query: ({ slug, lang }) => ({
        url: `/collections/slug/${slug}`,
        headers: lang ? { 'Accept-Language': lang } : undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              { type: 'ProductCollection' as const, id: result.slug },
              { type: 'ProductCollection' as const, id: 'LIST' },
            ]
          : [{ type: 'ProductCollection' as const, id: 'LIST' }],
    }),
    getResolvedCollections: builder.query<
      ResolvedPlacementCollection[],
      { lang?: string } | void
    >({
      async queryFn(arg, _api, _extraOptions, fetchWithBQ) {
        const lang = (arg as { lang?: string } | undefined)?.lang
        const listResult = await fetchWithBQ({
          url: '/collections',
          headers: lang ? { 'Accept-Language': lang } : undefined,
        })

        if (listResult.error) {
          return { error: listResult.error }
        }

        const collections = (listResult.data ?? []) as ProductCollection[]
        const sortedCollections = [...collections].sort((a, b) => a.sortOrder - b.sortOrder)
        if (sortedCollections.length === 0) {
          return { data: [] }
        }

        const detailsResults = await Promise.all(
          sortedCollections.map((collection) =>
            fetchWithBQ({
              url: `/collections/slug/${collection.slug}`,
              headers: lang ? { 'Accept-Language': lang } : undefined,
            }),
          ),
        )

        const failed = detailsResults.find((result) => !!result.error)
        if (failed?.error) {
          return { error: failed.error }
        }

        const data: ResolvedPlacementCollection[] = sortedCollections.map((collection, index) => {
          const detail = detailsResults[index]?.data as ProductCollectionBySlug | undefined
          return {
            ...collection,
            products: detail?.products ?? [],
          }
        })

        return { data }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({ type: 'ProductCollection' as const, id: item.id })),
              { type: 'ProductCollection' as const, id: 'LIST' },
            ]
          : [{ type: 'ProductCollection' as const, id: 'LIST' }],
    }),
  }),
})

export const {
  useGetProductCollectionsQuery,
  useGetProductCollectionBySlugQuery,
  useGetResolvedCollectionsQuery,
} = productCollectionsApi
