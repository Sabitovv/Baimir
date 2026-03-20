import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import i18n from 'i18next'

export type CreateReviewRequest = {
  authorName: string
  text: string
  rating: number
  source: string
}

export type CreateReviewResponse = {
  id: number
  authorName: string
  authorDescription: string 
  text: string
  rating: number
  reviewDate?: string
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
      query: (data) => ({
        url: '/reviews',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Review', id: 'LIST' }],
    }),
  }),
})

export const { useCreateReviewMutation, useGetReviewsQuery } = reviewsApi
