import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import i18n from 'i18next'

export type CreateReviewRequest = {
  authorName: string
  authorDescription: {
    ru?: string
    en?: string
    kz?: string
  }
  text: {
    ru?: string
    en?: string
    kz?: string
  }
  rating: number
  profileUrl?: string
  sortOrder?: number
  image?: File | null
}

export type CreateReviewResponse = {
  id: number
  authorName: string
  authorDescription: {
    ru?: string
    en?: string
    kz?: string
  }
  text: {
    ru?: string
    en?: string
    kz?: string
  }
  rating: number
  profileUrl?: string
  sortOrder: number
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export const reviewsApi = createApi({
  reducerPath: 'reviewsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers) => {
      const lang = i18n.language || 'ru'
      headers.set('Accept-Language', lang)
      return headers
    },
  }),
  tagTypes: ['Review'],
  endpoints: (builder) => ({
    createReview: builder.mutation<CreateReviewResponse, CreateReviewRequest>({
      query: (data) => {
        const formData = new FormData()
        formData.append('authorName', data.authorName)
        
        const authorDesc = JSON.stringify(data.authorDescription)
        formData.append('authorDescription', authorDesc)
        
        const text = JSON.stringify(data.text)
        formData.append('text', text)
        
        formData.append('rating', String(data.rating))
        
        if (data.profileUrl) {
          formData.append('profileUrl', data.profileUrl)
        }
        
        formData.append('sortOrder', String(data.sortOrder ?? 0))
        
        if (data.image) {
          formData.append('image', data.image)
        }

        return {
          url: '/api/v1/admin/reviews',
          method: 'POST',
          body: formData,
        }
      },
      invalidatesTags: [{ type: 'Review', id: 'LIST' }],
    }),
  }),
})

export const { useCreateReviewMutation } = reviewsApi
