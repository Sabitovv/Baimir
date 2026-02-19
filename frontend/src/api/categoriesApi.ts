import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export type Category = {
  id: number | string
  name: string
  slug?: string
  parentId?: number | null
  children?: Category[]
  isActive?: boolean
  imageUrl?: string;
}

export type ProductCategoryShort = {
  id: number
  slug: string
  name: string
}

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

export type ProductsQueryParams = {
  categoryId: number
  page: number
  limit: number
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
    baseUrl: 'http://localhost:8080/api/v1',
    prepareHeaders: (headers) => {
      const token = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbkBiYXltaXIuY29tIiwiaWF0IjoxNzY5OTM2ODM0LCJleHAiOjE4MDE0NzI4MzR9.JJTbaaimIAl8Tf9RVF-jbM5IgB3F1aH-od76Nit9Hp0s8ffxe9QsW6_x879Y9DqP41m3HYmSc23Ul8hyK0O1Sw';
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Category', 'Product'],
  endpoints: (builder) => ({
    getCategoriesTree: builder.query<Category[], void>({
      query: () => '/categories/tree',
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
      query: ({ categoryId, ...params }) => ({
        url: `/products/category/${categoryId}`,
        params
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

    getProductById: builder.query<Product, number>({
      query: (id) => `/products/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Product', id }],
    }),
  }),
})

export const {
  useGetCategoriesTreeQuery,
  useGetCategoriesRootQuery,
  useGetProductsQuery,
  useGetProductByIdQuery,
} = categoriesApi
