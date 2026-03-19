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
  authorDescription: string 
  text: string
  rating: number
  profileUrl?: string
  sortOrder: number
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

// 2. Создаем алиас (синоним) для удобства использования в компонентах
export type Review = CreateReviewResponse;

// 3. Создаем сам API
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
    
    // Эндпоинт для получения списка отзывов
    getReviews: builder.query<Review[], void>({
      query: () => '/reviews',
      providesTags: [{ type: 'Review', id: 'LIST' }],
    }),
    
    // Эндпоинт для создания нового отзыва
    createReview: builder.mutation<CreateReviewResponse, CreateReviewRequest>({
      query: (data) => {
        const formData = new FormData()
        
        const reviewPayload = {
          authorName: data.authorName,
          authorDescription: data.authorDescription,
          text: data.text,
          rating: data.rating,
          profileUrl: data.profileUrl,
          sortOrder: data.sortOrder ?? 0,
        }

        const reviewBlob = new Blob([JSON.stringify(reviewPayload)], {
          type: 'application/json',
        })
        
        formData.append('review', reviewBlob)
        
        if (data.image) {
          formData.append('image', data.image)
        }

        return {
          url: '/reviews', 
          method: 'POST',
          body: formData,
        }
      },
      invalidatesTags: [{ type: 'Review', id: 'LIST' }],
    }),
  }),
})

export const { useCreateReviewMutation, useGetReviewsQuery } = reviewsApi