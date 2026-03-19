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
    // Убедитесь, что VITE_API_BASE_URL указывает на http://localhost:8080/api/v1
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
        
        // 1. Собираем все текстовые данные в один объект
        const reviewPayload = {
          authorName: data.authorName,
          authorDescription: data.authorDescription,
          text: data.text,
          rating: data.rating,
          profileUrl: data.profileUrl,
          sortOrder: data.sortOrder ?? 0,
        }

        // 2. Создаем Blob с явным указанием типа application/json
        const reviewBlob = new Blob([JSON.stringify(reviewPayload)], {
          type: 'application/json',
        })
        
        // 3. Добавляем Blob в formData под ключом 'review'
        formData.append('review', reviewBlob)
        
        // 4. Добавляем файл, если он есть
        if (data.image) {
          formData.append('image', data.image)
        }

        return {
          url: '/reviews', // Изменил URL в соответствии с вашим эндпоинтом
          method: 'POST',
          body: formData,
        }
      },
      invalidatesTags: [{ type: 'Review', id: 'LIST' }],
    }),
  }),
})

export const { useCreateReviewMutation } = reviewsApi