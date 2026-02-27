import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import i18n from 'i18next'

export type Category = {
  id: number | string
  name: string
  slug?: string
  parentId?: number | null
  children?: Category[]
  isActive?: boolean
  imageUrl?: string
}

export type ProductCategoryShort = { id: number; slug: string; name: string }

export type Product = {
  id: number
  slug: string
  name: string
  price: number
  coverImage?: string | null
  inStock: boolean
  sku?: string
  category?: ProductCategoryShort
}

export type FilterValue = {
  id: string
  label: string
  count: number
  selected: boolean
}
export type Filter = {
  code: string
  name: string
  uiType: string
  range?: { min: number; max: number } | null
  values?: FilterValue[] | null
}
export type Meta = {
  currentPage: number
  pageSize: number
  totalElements: number
  totalPages: number
}

export type ProductsResponse = {
  filters: Filter[]
  meta: Meta
  products: Product[]
}

// добавили lang? явно
export type ProductsQueryParams = {
  categoryId: number
  page: number
  limit: number
  lang?: string
} & Record<string, any>

export type Specifications = {
  name: string
  attributes: string[]
}

export type ProductInner = {
  products: Product[]
  specifications: Specifications[]
}

export const categoriesApi = createApi({
  reducerPath: 'categoriesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://89.207.255.17/api/v1',

    prepareHeaders: (headers) => {
      const lang = i18n.language || 'ru'
      headers.set('Accept-Language', lang)
      return headers
    },
  }),
  tagTypes: ['Category', 'Product'],
  endpoints: (builder) => ({
    getCategoriesTree: builder.query<Category[], { lang?: string } | void>({
      query: (arg) => {
        const lang = (arg as { lang?: string })?.lang
        return {
          url: '/categories/tree',
          headers: lang ? { 'Accept-Language': lang } : undefined,
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((cat) => ({ type: 'Category' as const, id: cat.id })),
              { type: 'Category' as const, id: 'LIST' },
            ]
          : [{ type: 'Category' as const, id: 'LIST' }],
    }),

    getCategoriesRoot: builder.query<Category[], void>({
      query: () => '/categories/roots',

      providesTags: (result) =>
        result
          ? [
              ...result.map((cat) => ({ type: 'Category' as const, id: cat.id })),
              { type: 'Category' as const, id: 'LIST' },
            ]
          : [{ type: 'Category' as const, id: 'LIST' }],
    }),

    getProducts: builder.query<ProductsResponse, ProductsQueryParams>({
      query: ({ categoryId, lang, ...params }) => ({
        url: `/products/category/${categoryId}`,
        params,
        headers: lang ? { 'Accept-Language': lang } : undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.products.map((prod) => ({ type: 'Product' as const, id: prod.id })),
              { type: 'Product' as const, id: 'LIST' },
            ]
          : [{ type: 'Product' as const, id: 'LIST' }],
    }),

    getProductById: builder.query<Product, number>({
      query: (id) => `/products/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Product' as const, id }],
    }),
  }),
})

export const {
  useGetCategoriesTreeQuery,
  useGetCategoriesRootQuery,
  useGetProductsQuery,
  useGetProductByIdQuery,
} = categoriesApi