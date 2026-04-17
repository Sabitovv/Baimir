import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export type UploadStaticImageArg = {
  settingKey: string
  imageKey: string
  file: File
  alt?: string // Добавили опциональный alt text
}

// Новый тип для обновления только alt текста
export type UpdateStaticImageAltArg = {
  settingKey: string
  imageKey: string
  alt: string
}

export const staticImagesApi = createApi({
  reducerPath: 'staticImagesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken')
      if (token) headers.set('Authorization', `Bearer ${token}`)
      return headers
    },
  }),
  tagTypes: ['StaticImages'],
  endpoints: (builder) => ({
    // GET /api/v1/settings/static-images/{settingKey}
    getStaticImages: builder.query<Record<string, string>, string>({
      query: (settingKey) => `/settings/static-images/${settingKey}`,
      providesTags: ['StaticImages'],
    }),

    // POST /api/v1/admin/settings/static-images/{settingKey}/{imageKey}/upload?alt={altText}
    uploadStaticImage: builder.mutation<string, UploadStaticImageArg>({
      query: ({ settingKey, imageKey, file, alt }) => {
        const formData = new FormData()
        formData.append('file', file)

        return {
          url: `/admin/settings/static-images/${settingKey}/${imageKey}/upload`,
          method: 'POST',
          body: formData,
          // Если alt передан, RTK Query автоматически добавит его в URL как ?alt=...
          params: alt ? { alt } : undefined, 
          responseHandler: 'text', 
        }
      },
      invalidatesTags: ['StaticImages'], 
    }),

    // PATCH /api/v1/admin/settings/static-images/{settingKey}/{imageKey}/alt?alt={altText}
    updateStaticImageAlt: builder.mutation<string, UpdateStaticImageAltArg>({
      query: ({ settingKey, imageKey, alt }) => ({
        url: `/admin/settings/static-images/${settingKey}/${imageKey}/alt`,
        method: 'PATCH',
        // Передаем alt как query-параметр
        params: { alt },
        responseHandler: 'text', // Добавлено на случай, если бэкенд тоже возвращает строку
      }),
      invalidatesTags: ['StaticImages'], 
    }),
  }),
})

export const { 
  useGetStaticImagesQuery, 
  useUploadStaticImageMutation,
  useUpdateStaticImageAltMutation
} = staticImagesApi