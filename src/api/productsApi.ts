import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
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

/**
 * Query parameters for fetching products
 */
export type ProductsQueryParams = {
    categoryId: number
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
} & Record<string, any>

// ============================================================================
// API DEFINITION
// ============================================================================

export const productsApi = createApi({
    reducerPath: 'productsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:8080/api/v1',
        prepareHeaders: (headers) => {
            // TODO: Replace with dynamic token from auth store
            const token = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbkBiYXltaXIuY29tIiwiaWF0IjoxNzY5OTM2ODM0LCJleHAiOjE4MDE0NzI4MzR9.JJTbaaimIAl8Tf9RVF-jbM5IgB3F1aH-od76Nit9Hp0s8ffxe9QsW6_x879Y9DqP41m3HYmSc23Ul8hyK0O1Sw'
            if (token) {
                headers.set('Authorization', `Bearer ${token}`)
            }
            return headers
        },
    }),
    tagTypes: ['Product'],
    endpoints: (builder) => ({
        /**
         * Get products by category with filtering and pagination
         */
        getProducts: builder.query<ProductsResponse, ProductsQueryParams>({
            query: ({ categoryId, ...params }) => ({
                url: `/products/category/${categoryId}`,
                params: {
                    page: params.page || 1,
                    limit: params.limit || 20,
                    ...params,
                },
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.products.map((prod) => ({
                            type: 'Product' as const,
                            id: prod.id,
                        })),
                        { type: 'Product', id: 'LIST' },
                    ]
                    : [{ type: 'Product', id: 'LIST' }],
        }),

        /**
         * Get product by ID
         */
        getProductById: builder.query<ProductDetail, number>({
            query: (id) => `/products/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Product', id }],
        }),

        /**
         * Get product by slug
         */
        getProductBySlug: builder.query<ProductDetail, string>({
            query: (slug) => `/products/${slug}`,
            providesTags: (result) =>
                result ? [{ type: 'Product', id: result.id }] : [],
        }),

        /**
         * Search products
         */
        searchProducts: builder.query<ProductsResponse, {
            query: string
            page?: number
            limit?: number
        }>({
            query: ({ query, page = 1, limit = 20 }) => ({
                url: '/products/search',
                params: { q: query, page, limit },
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.products.map((prod) => ({
                            type: 'Product' as const,
                            id: prod.id,
                        })),
                        { type: 'Product', id: 'SEARCH' },
                    ]
                    : [{ type: 'Product', id: 'SEARCH' }],
        }),


        getFeaturedProducts: builder.query<Product[], { limit?: number }>({
            query: ({ limit = 10 }) => ({
                url: '/products/featured',
                params: { limit },
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.map((prod) => ({
                            type: 'Product' as const,
                            id: prod.id,
                        })),
                        { type: 'Product', id: 'FEATURED' },
                    ]
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
