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

export type Breadcrumb = ProductCategory

export type SpecificationAttribute = {
    name: string
    value: string
    unit: string | null
    code: string
}
export type SpecificationGroup = {
    name: string
    attributes: SpecificationAttribute[]
}

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

export type ProductMedia = {
    id?: number
    url: string
    type: 'image' | 'video' | 'IMAGE' | 'VIDEO' | 'VIDEO_EXTERNAL'
    alt?: string | null
    altText?: string | null
    sortOrder?: number
    isPrimary?: boolean
}

export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'imageCard'
  | 'youtube'
  | 'table'
  | 'gallery'
  | 'list'
  | 'cardGrid'
  | 'productLink'

export interface BaseBlock {
  id: string
  type: BlockType
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading'
  data: { text: string; level: 1 | 2 | 3; subtitle?: string }
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph'
  data: { text: string }
}

export interface ImageCardBlock extends BaseBlock {
  type: 'imageCard'
  data: {
    imageUrl: string
    title: string
    description: string
    position: 'left' | 'right' | 'top' | 'bottom'
    imageWidth: '1/3' | '1/2' | '2/3' | 'full'
    imageRatio: 'video' | 'square' | 'portrait'
    verticalAlign: 'start' | 'center'
  }
}

export interface GridCardItem {
  imageUrl: string
  title: string
  description: string
}

export interface CardGridBlock extends BaseBlock {
  type: 'cardGrid'
  data: {
    columns: 2 | 3 | 4
    imageRatio: 'square' | 'video' | 'portrait'
    cards: GridCardItem[]
  }
}

export interface YoutubeBlock extends BaseBlock {
  type: 'youtube'
  data: { videoId: string; videoUrl?: string }
}

export interface TableBlock extends BaseBlock {
  type: 'table'
  data: { rows: string[][] }
}

export interface GalleryBlock extends BaseBlock {
  type: 'gallery'
  data: {
    urls: string[]
    layout: 'single' | 'grid' | 'carousel' | 'featured' | 'masonry'
  }
}

export interface ListBlock extends BaseBlock {
  type: 'list'
  data: {
    items: string[]
    style: 'bullet' | 'number' | 'check' | 'dash' | 'arrow'
  }
}

export interface ProductLinkBlock extends BaseBlock {
  type: 'productLink'
  data: {
    productIds: string[]
    layout: 'card' | 'grid' | 'carousel'
  }
}

export type ProductContentBlock =
  | HeadingBlock
  | ParagraphBlock
  | ImageCardBlock
  | YoutubeBlock
  | TableBlock
  | GalleryBlock
  | ListBlock
  | CardGridBlock
  | ProductLinkBlock

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
    contentBlocks?: ProductContentBlock[]
}

export type Product = {
    id: number
    slug: string
    name: string
    coverImage?: string | null
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

export type FilterValue = {
    id: string
    label: string
    count: number
    selected: boolean
}

export type Filter = {
    code: string
    name: string
    uiType: 'checkbox' | 'range' | 'select' | 'color'
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

export type ProductsQueryParams = {
  categoryId: number
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  lang?: string   
} & Record<string, string | number | boolean | undefined>

interface PageResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
}

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
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
          page: page ?? 0,
          limit: limit ?? 20,
          ...params,
        },
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
    getPopularProducts: builder.query<PageResponse<Product>, {page?: number, size?:number}>({
        query:({page=0, size=10})=>({url: "products/random", params: {page, size}}),
        providesTags: (result) =>
            result
                ? [...result.content.map((prod) => ({ type: 'Product' as const, id: prod.id })), { type: 'Product', id: 'POPULAR' }]
                : [{ type: 'Product', id: 'POPULAR' }],
    })
  }),
})

export const {
    useGetProductsQuery,
    useGetProductByIdQuery,
    useGetProductBySlugQuery,
    useSearchProductsQuery,
    useGetFeaturedProductsQuery,
    useGetPopularProductsQuery,
} = productsApi
