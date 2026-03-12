import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import i18n from 'i18next'

type LocalizedText = {
  ru?: string
  en?: string
  kz?: string
  kk?: string
}

export type BlogContentBlock = {
  type: string
  data?: {
    text?: string
    imageUrl?: string
    url?: string
    alt?: string
    title?: string
    level?: number
    items?: string[]
    ordered?: boolean
    caption?: string
    quote?: string
    author?: string
    rows?: string[][]
    [key: string]: unknown
  }
}

export type BlogListItem = {
  id: number
  slug: string
  title?: LocalizedText | string
  excerpt?: LocalizedText | string
  imageUrl?: string | null
  coverImage?: string | null
  coverImageUrl?: string | null
  thumbnailUrl?: string | null
  contentBlocks?: BlogContentBlock[]
  readingTime?: number
  viewsCount?: number
  authorName?: string
  publishedAt?: string
}

export type BlogDetail = {
  id: number
  slug: string
  title?: LocalizedText | string
  excerpt?: LocalizedText | string
  imageUrl?: string | null
  coverImage?: string | null
  coverImageUrl?: string | null
  thumbnailUrl?: string | null
  contentBlocks?: BlogContentBlock[]
  readingTime?: number
  viewsCount?: number
  authorName?: string
  publishedAt?: string
}

export type PageResponse<T> = {
  content: T[]
  empty: boolean
  first: boolean
  last: boolean
  number: number
  numberOfElements: number
  size: number
  totalElements: number
  totalPages: number
}

export type BlogsQueryParams = {
  page?: number
  size?: number
  sort?: string
  lang?: string
}

export const blogsApi = createApi({
  reducerPath: 'blogsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://89.207.255.17/api/v1',
    prepareHeaders: (headers) => {
      const lang = i18n.language || 'ru'
      headers.set('Accept-Language', lang)
      return headers
    },
  }),
  tagTypes: ['Blog'],
  endpoints: (builder) => ({
    getBlogs: builder.query<PageResponse<BlogListItem>, BlogsQueryParams | void>({
      query: (arg) => {
        const params = arg ?? {}
        return {
          url: '/blogs',
          params: {
            page: params.page ?? 0,
            size: params.size ?? 12,
            sort: params.sort ?? 'publishedAt,DESC',
          },
          headers: params.lang ? { 'Accept-Language': params.lang } : undefined,
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.content.map((item) => ({ type: 'Blog' as const, id: item.id })),
              { type: 'Blog' as const, id: 'LIST' },
            ]
          : [{ type: 'Blog' as const, id: 'LIST' }],
    }),
    getBlogBySlug: builder.query<BlogDetail, { slug: string; lang?: string }>({
      query: ({ slug, lang }) => ({
        url: `/blogs/${slug}`,
        headers: lang ? { 'Accept-Language': lang } : undefined,
      }),
      providesTags: (result) => (result ? [{ type: 'Blog' as const, id: result.id }] : []),
    }),
  }),
})

export const { useGetBlogsQuery, useGetBlogBySlugQuery } = blogsApi
