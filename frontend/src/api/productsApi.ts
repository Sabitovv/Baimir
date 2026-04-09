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
    coverImage?: string | null
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
    keyFeatures?: Array<{
        code: string
        label: string
        value: string | number
        unit?: string
    }>
}

export type FilterValue = {
    id: string
    label: string
    count: number
    selected: boolean
}

export type FilterRange = {
    max: number
    min: number
    step: number | null
}

export type Filter = {
    code: string
    name: string
    range: FilterRange | null
    uiType: 'RANGE_SLIDER' | 'CHECKBOX_LIST'
    unitCode: string | null
    values: FilterValue[] | null
}

export type InquiryItem = {
  productId: number
  quantity: number
}

export type InquiryRequest = {
  name: string
  email: string
  phone: string
  message?: string
  items: InquiryItem[]
  sourceUrl: string
}

export type CompareAttribute = {
  attributeName: string
  values: Record<string, string>
}

export type CompareProduct = {
  id: number
  slug: string
  sku: string
  name: string
  brandName: string | null
  categoryName: string
  coverImage: string | null
  price: number
  oldPrice: number | null
  discountPercent: number | null
  inStock: boolean
  hasVariants: boolean
  reviewsCount: number
  keyFeatures: unknown
  medias: unknown
}

export type CompareGroup = {
  categoryId: number
  categoryName: string
  products: CompareProduct[]
  attributes: CompareAttribute[]
}

export type WorkScheduleDayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export type WorkInterval = {
  start: string
  end: string
}

export type WorkDaySchedule = {
  isDayOff: boolean
  intervals: WorkInterval[]
}

export type WorkScheduleException = {
  startDate: string
  endDate: string
  isDayOff: boolean
  intervals: WorkInterval[]
  note?: string
}

export type CompanyWorkSchedule = {
  timezone?: string
  regular?: Partial<Record<WorkScheduleDayKey, WorkDaySchedule>>
  exceptions?: WorkScheduleException[]
}

export type CompanyInfoLocalizedText = {
  ru?: string
  kk?: string
  en?: string
}

export type CompanyInfoField = {
  id: string
  label?: CompanyInfoLocalizedText
  value?: CompanyInfoLocalizedText
}

export type CompanyInfoSection = {
  id: string
  title?: CompanyInfoLocalizedText
  fields?: CompanyInfoField[]
}

export type CompanyInfoSections = {
  sections?: CompanyInfoSection[]
}

export type CompanyManager = {
  id: string
  firstName?: string
  lastName?: string
  position?: string
  phone?: string
  photoUrl?: string
}

export type CompanyManagers = {
  managers?: CompanyManager[]
}

export type CompanySettingsResponse = {
  COMPANY_WORK_SCHEDULE?: CompanyWorkSchedule
  COMPANY_INFO_SECTIONS?: CompanyInfoSections
  COMPANY_MANAGERS?: CompanyManagers
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

  getProductsBatch: builder.query<ProductDetail[], (string | number)[]>({
    query: (ids) => {
      const params = new URLSearchParams()
      ids.forEach(id => params.append('ids', String(id)))
      
      return {
        url: `/products/batch?${params.toString()}`,
      }
    },
    providesTags: (result) =>
      result
        ? [
            ...result.map((prod) => ({ type: 'Product' as const, id: prod.id })),
            { type: 'Product', id: 'BATCH' },
          ]
        : [{ type: 'Product', id: 'BATCH' }],
  }),

    getProductBySlug: builder.query<ProductDetail, { slug: string; lang?: string }>({
      query: ({ slug, lang }) => ({
        url: `/products/${slug}`,
        headers: lang ? { 'Accept-Language': lang } : undefined,
      }),
      providesTags: (result) => (result ? [{ type: 'Product' as const, id: result.id }] : []),
    }),

    searchProducts: builder.query<PageResponse<Product>, { query: string; page?: number; size?: number; sort?: string }>({
      query: ({ query, page = 0, size = 20, sort = 'id,DESC' }) => ({
        url: '/products/search',
        params: { query, page, size, sort },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.content.map((prod) => ({ type: 'Product' as const, id: prod.id })),
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
    }),

    createInquiry: builder.mutation<any, InquiryRequest>({
      query: (body) => ({
        url: '/inquiries', 
        method: 'POST',
        body,
      }),
    }),

    getProductsCompare: builder.query<CompareGroup[], number[]>({
      query: (ids) => {
        const params = new URLSearchParams()
        ids.forEach((id) => params.append('ids', String(id)))

        return {
          url: `/products/compare?${params.toString()}`,
        }
      },
      transformResponse: (response: CompareGroup | CompareGroup[]) =>
        Array.isArray(response) ? response : [response],
    }),

    getCompanySettings: builder.query<CompanySettingsResponse, void>({
      query: () => ({
        url: import.meta.env.VITE_COMPANY_SETTINGS_URL ?? 'http://89.207.255.17/api/v1/company-settings',
      }),
    }),
  }),
})

export const {
    useGetProductsQuery,
    useGetProductsBatchQuery,
    useGetProductBySlugQuery,
    useSearchProductsQuery,
    useGetFeaturedProductsQuery,
    useGetPopularProductsQuery,
    useCreateInquiryMutation,
    useGetProductsCompareQuery,
    useGetCompanySettingsQuery,
} = productsApi
