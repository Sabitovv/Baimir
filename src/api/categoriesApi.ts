import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * Тип категории — можно расширить по вашему API
 * Я держу типы рядом с сервисом, как вы просили.
 */
export type Category = {
  id: number | string;
  name: string;
  slug?: string;
  parentId?: number | null;
  children?: Category[]; // дерево
  isActive?: boolean;
  // добавьте другие поля, которые приходят с бэка
};

export const categoriesApi = createApi({
  reducerPath: 'categoriesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8080/api/v1',

    prepareHeaders: (headers) => {
      const token = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbkBiYXltaXIuY29tIiwiaWF0IjoxNzY5OTM2ODM0LCJleHAiOjE4MDE0NzI4MzR9.JJTbaaimIAl8Tf9RVF-jbM5IgB3F1aH-od76Nit9Hp0s8ffxe9QsW6_x879Y9DqP41m3HYmSc23Ul8hyK0O1Sw';

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },

    // если нужен токен — используйте prepareHeaders и доставайте token из state
    // prepareHeaders: (headers, { getState }) => {
      // пример:
    //   const token = (getState() as RootState).auth.token;
    //   if (token) headers.set('Authorization', `Bearer ${token}`);
    //   return headers;
    // },
    // credentials: 'include', // если бэку нужны куки, иначе удалите
  }),
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    // GET /categories/tree
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
    getProduct: builder.query<Category[], void>({
      query: () =>'/'
    })
  })
})

export const { useGetCategoriesTreeQuery, useGetCategoriesRootQuery } = categoriesApi;