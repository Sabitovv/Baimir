import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import i18n from "i18next";

export type Category = {
  id: number | string;
  name: string;
  slug?: string;
  parentId?: number | null;
  children?: Category[];
  isActive?: boolean;
  imageUrl?: string;
  productCount?: number;
};

export type ProductCategoryShort = { id: number; slug: string; name: string };

export type Product = {
  id: number;
  slug: string;
  name: string;
  price: number;
  oldPrice?: number | null;
  coverImage?: string | null;
  inStock: boolean;
  newProduct?: boolean;
  new?: boolean;
  sku?: string;
  category?: ProductCategoryShort;
};

export type FilterValue = {
  id: string;
  label: string;
  count: number;
  selected: boolean;
};
export type FilterRange = {
  max: number;
  min: number;
  step: number | null;
};
export type Filter = {
  code: string;
  name: string;
  range: FilterRange | null;
  uiType: "RANGE_SLIDER" | "CHECKBOX_LIST";
  unitCode: string | null;
  values: FilterValue[] | null;
};
export type Meta = {
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
};

export type ProductsResponse = {
  filters: Filter[];
  meta: Meta;
  products: Product[];
};

// добавили lang? явно
export type ProductsQueryParams = {
  categoryId: number;
  page: number;
  limit: number;
  lang?: string;
} & Record<string, string | number | boolean | undefined>;

export type Specifications = {
  name: string;
  attributes: string[];
};

export type ProductInner = {
  products: Product[];
  specifications: Specifications[];
};

export type InquiryRequest = {
  name: string;
  email?: string | null;
  phone?: string | null;
  message?: string;
  productId?: number | null;
  sourceUrl?: string;
};

export type InquiryResponse = {
  id?: number;
  message?: string;
};

export const categoriesApi = createApi({
  reducerPath: "categoriesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,

    prepareHeaders: (headers) => {
      const lang = i18n.language || "ru";
      headers.set("Accept-Language", lang);
      return headers;
    },
  }),
  tagTypes: ["Category", "Product"],
  endpoints: (builder) => ({
    getCategoriesTree: builder.query<Category[], { lang?: string } | void>({
      query: (arg) => {
        const lang = (arg as { lang?: string })?.lang;
        return {
          url: "/categories/tree",
          headers: lang ? { "Accept-Language": lang } : undefined,
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((cat) => ({
                type: "Category" as const,
                id: cat.id,
              })),
              { type: "Category" as const, id: "LIST" },
            ]
          : [{ type: "Category" as const, id: "LIST" }],
    }),

    getCategoriesRoot: builder.query<Category[], void>({
      query: () => "/categories/roots",

      providesTags: (result) =>
        result
          ? [
              ...result.map((cat) => ({
                type: "Category" as const,
                id: cat.id,
              })),
              { type: "Category" as const, id: "LIST" },
            ]
          : [{ type: "Category" as const, id: "LIST" }],
    }),

    getProducts: builder.query<ProductsResponse, ProductsQueryParams>({
      query: ({ categoryId, lang, ...params }) => ({
        url: `/products/category/${categoryId}`,
        params,
        headers: lang ? { "Accept-Language": lang } : undefined,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.products.map((prod) => ({
                type: "Product" as const,
                id: prod.id,
              })),
              { type: "Product" as const, id: "LIST" },
            ]
          : [{ type: "Product" as const, id: "LIST" }],
    }),

    getProductById: builder.query<Product, number>({
      query: (id) => `/products/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Product" as const, id }],
    }),

    createInquiry: builder.mutation<InquiryResponse, InquiryRequest>({
      query: (body) => ({
        url: "/inquiries",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetCategoriesTreeQuery,
  useGetCategoriesRootQuery,
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateInquiryMutation,
} = categoriesApi;
