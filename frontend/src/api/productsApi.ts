import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import i18n from 'i18next'

export type ProductCategory = {
    id: number
    slug: string
    name: string
    description: string
    parentId: number | null
    level: number
    imageUrl: string | null
    iconUrl: string | null
    sortOrder: number
}

/**
 * Breadcrumb item for product navigation
 */
export type Breadcrumb = ProductCategory

/**
 * Attribute within a specification group
 */
export type SpecificationAttribute = {
    name: string
    value: string
    unit: string | null
    code: string
}

/**
 * Group of related specifications
 */
export type SpecificationGroup = {
    name: string
    attributes: SpecificationAttribute[]
}

/**
 * Product variant (e.g., different colors/sizes)
 */
export type ProductVariant = {
    id: number
    slug: string
    sku: string
    name: string
    price: number
    oldPrice: number | null
    inStock: boolean
    stockQuantity: number
    attributes: Record<string, string>
}

/**
 * Media item for product (images/videos)
 */
export type ProductMedia = {
    id: number
    url: string
    type: 'image' | 'video'
    alt?: string
    sortOrder: number
    isPrimary: boolean
}

/**
 * Complete product detail response
 */
export type ProductDetail = {
    id: number
    slug: string
    sku: string
    name: string
    description: string
    price: number
    oldPrice: number | null
    discountPercent: number | null
    inStock: boolean
    stockQuantity: number
    media: ProductMedia[] | null
    category: ProductCategory
    breadcrumbs: Breadcrumb[]
    specifications: SpecificationGroup[]
    variants: ProductVariant[]
}

/**
 * Simplified product for lists/grids
 */
export type Product = {
    id: number
    slug: string
    name: string
    price: number
    oldPrice?: number | null
    description: string
    sku?: string
    inStock: boolean
    stockQuantity: number

    category?: {
        id: number
        name: string
        slug: string
    }
    media?: Array<{
        type: 'image' | 'video'
        url: string
        sortOrder: number
    }>
    specifications?: Array<{
        name: string
        attributes: Array<{ name: string; value: string; unit?: string | null }>
    }>
    variants?: Array<{
        id: number
        name: string
        sku: string
        price: number
        attributes: Record<string, string>
    }>
    discountPercent?: number
}

/**
 * Filter value option
 */
export type FilterValue = {
    id: string
    label: string
    count: number
    selected: boolean
}

/**
 * Filter configuration
 */
export type Filter = {
    code: string
    name: string
    uiType: 'checkbox' | 'range' | 'select' | 'color'
    range?: { min: number; max: number } | null
    values?: FilterValue[] | null
}

/**
 * Pagination metadata
 */
export type Meta = {
    currentPage: number
    pageSize: number
    totalElements: number
    totalPages: number
}

/**
 * Products list response with filters
 */
export type ProductsResponse = {
    filters: Filter[]
    meta: Meta
    products: Product[]
}

export type ProductsQueryParams = {
  categoryId: number
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  lang?: string    // <- добавлено
} & Record<string, any>

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://89.207.255.17/api/v1',
    prepareHeaders: (headers) => {
      const lang = i18n.language || 'ru'
      headers.set('Accept-Language', lang)
      // если нужен токен, тут же можно его подставлять:
      // const token = localStorage.getItem('token') || undefined
      // if (token) headers.set('Authorization', `Bearer ${token}`)
      return headers
    },
  }),
  tagTypes: ['Product'],
  endpoints: (builder) => ({
    getProducts: builder.query<ProductsResponse, ProductsQueryParams>({
      query: ({ categoryId, lang, page, limit, ...params }) => ({
        url: `/products/category/${categoryId}`,
        params: {
          page: page ?? 1,
          limit: limit ?? 20,
          ...params,
        },
        // если передали lang в аргументе — переопределим заголовок для этого запроса
        headers: lang ? { 'Accept-Language': lang } : undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.products.map((prod) => ({ type: 'Product' as const, id: prod.id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),

    getProductById: builder.query<ProductDetail, number>({
      query: (id) => `/products/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Product' as const, id }],
    }),

    // Сделаем slug-эндпоинт, принимающий объект { slug, lang? } — чтобы можно было автоперезапросить при смене языка
    getProductBySlug: builder.query<ProductDetail, { slug: string; lang?: string }>({
      query: ({ slug, lang }) => ({
        url: `/products/${slug}`,
        headers: lang ? { 'Accept-Language': lang } : undefined,
      }),
      providesTags: (result) => (result ? [{ type: 'Product' as const, id: result.id }] : []),
    }),

    searchProducts: builder.query<ProductsResponse, { query: string; page?: number; limit?: number }>({
      query: ({ query, page = 0, limit = 20 }) => ({
        url: '/products/search',
        params: { q: query, page, limit },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.products.map((prod) => ({ type: 'Product' as const, id: prod.id })),
              { type: 'Product', id: 'SEARCH' },
            ]
          : [{ type: 'Product', id: 'SEARCH' }],
    }),

    getFeaturedProducts: builder.query<Product[], { limit?: number }>({
      query: ({ limit = 10 }) => ({ url: '/products/featured', params: { limit } }),
      providesTags: (result) =>
        result
          ? [...result.map((prod) => ({ type: 'Product' as const, id: prod.id })), { type: 'Product', id: 'FEATURED' }]
          : [{ type: 'Product', id: 'FEATURED' }],
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductBySlugQuery,
  useSearchProductsQuery,
  useGetFeaturedProductsQuery,
} = productsApi