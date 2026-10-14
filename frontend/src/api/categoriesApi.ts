import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import i18n from "i18next";
import { mirrorSavedInquiry } from "@/utils/bitrixForm";
import type { LaserOptions } from '@/utils/laserSelection';

export type Category = {
  id: number | string;
  name: string;
  slug?: string;
  parentId?: number | null;
  children?: Category[];
  isActive?: boolean;
  imageUrl?: string;
  productCount?: number | string;
  productsCount?: number | string;
  count?: number | string;
};

export type ProductCategoryShort = { id: number; slug: string; name: string };

export type Product = import('../utils/productAvailability').AvailabilityInfo & {
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
  uiType: "RANGE_SLIDER" | "CHECKBOX_LIST" | "RADIO_LIST";
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

export type PressBrakeOptions = {
  available: boolean;
  totalProducts: number;
  capabilities: { force: number; length: number; count: number }[];
  panelBenders?: { available: boolean; totalProducts: number; materials: string[] };
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
  items?: { productId: number; quantity: number }[];
  // Client-only snapshots for CRM; not part of the backend inquiry payload.
  crmItems?: { productId: number; quantity: number; productNameSnapshot: string; priceSnapshot?: number | null }[];
  sourceUrl?: string;
};

export type InquiryResponse = {
  id?: number;
  message?: string;
  items?: {
    productId: number;
    quantity: number;
    productNameSnapshot?: string;
    priceSnapshot?: number | null;
    productUrl?: string;
  }[];
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
    getLaserOptions: builder.query<LaserOptions, { categoryId: number; lang: string }>({
      query: ({ categoryId, lang }) => ({ url: `/products/category/${categoryId}/laser-options`, headers: { 'Accept-Language': lang } }),
      providesTags: [{ type: 'Product', id: 'LIST' }, { type: 'Category', id: 'LIST' }],
    }),
    getPressBrakeOptions: builder.query<PressBrakeOptions, number>({
      query: (categoryId) => `/products/category/${categoryId}/press-brake-options`,
      providesTags: [{ type: "Product", id: "LIST" }, { type: "Category", id: "LIST" }],
    }),
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
      query: ({ categoryId, lang, limit, ...params }) => ({
        url: `/products/category/${categoryId}`,
        params: { ...params, size: limit },
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

    createInquiry: builder.mutation<InquiryResponse | null, InquiryRequest>({
      query: (request) => {
        const body = { ...request };
        delete body.crmItems;
        return { url: "/inquiries", method: "POST", body };
      },
      onQueryStarted(request, { queryFulfilled, requestId }) {
        void mirrorSavedInquiry(request, queryFulfilled, i18n.language || "ru", requestId);
      },
    }),
  }),
});

export const {
  useGetLaserOptionsQuery,
  useGetPressBrakeOptionsQuery,
  useGetCategoriesTreeQuery,
  useGetCategoriesRootQuery,
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateInquiryMutation,
} = categoriesApi;
