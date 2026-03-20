import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import i18n from 'i18next'

export type Certificate = {
  id: number
  name: string
  imageUrl: string
}

type CertificatesPayload =
  | Certificate[]
  | {
      content?: Certificate[]
      items?: Certificate[]
    }

export const certificatesApi = createApi({
  reducerPath: 'certificatesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers) => {
      const lang = i18n.language || 'ru'
      headers.set('Accept-Language', lang)
      return headers
    },
  }),
  tagTypes: ['Certificate'],
  endpoints: (builder) => ({
    getCertificates: builder.query<Certificate[], void>({
      query: () => '/certificates',
      transformResponse: (response: CertificatesPayload) => {
        if (Array.isArray(response)) return response
        return response.content || response.items || []
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((certificate) => ({ type: 'Certificate' as const, id: certificate.id })),
              { type: 'Certificate', id: 'LIST' },
            ]
          : [{ type: 'Certificate', id: 'LIST' }],
    }),
  }),
})

export const { useGetCertificatesQuery } = certificatesApi
