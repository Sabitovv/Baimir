import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export type UploadStaticImageArg = {
  settingKey: string
  imageKey: string
  file: File
}

export const staticImagesApi = createApi({
  reducerPath: 'staticImagesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers) => {
      // Если для /admin/ роутов нужен токен авторизации, добавь его сюда
      const token = localStorage.getItem('token')
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

    // POST /api/v1/admin/settings/static-images/{settingKey}/{imageKey}/upload
    uploadStaticImage: builder.mutation<string, UploadStaticImageArg>({
      query: ({ settingKey, imageKey, file }) => {
        const formData = new FormData()
        formData.append('file', file)

        return {
          url: `/admin/settings/static-images/${settingKey}/${imageKey}/upload`,
          method: 'POST',
          body: formData,
          responseHandler: 'text', // Бэкенд возвращает просто строку (ResponseEntity<String>)
        }
      },
      // Автоматически инвалидируем кэш, чтобы getStaticImages запросил свежий словарь
      invalidatesTags: ['StaticImages'], 
    }),
  }),
})

export const { useGetStaticImagesQuery, useUploadStaticImageMutation } = staticImagesApi