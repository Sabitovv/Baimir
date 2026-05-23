import { useMemo } from 'react'
import {
  type CollectionPlacementType,
  useGetResolvedCollectionsQuery,
} from '@/api/productCollectionsApi'

export const useProductCollectionPlacement = (
  placement: CollectionPlacementType,
  options?: {
    lang?: string
    skip?: boolean
    maxItems?: number
    categoryId?: number
    requireCategoryId?: boolean
    page?: number
    size?: number
    sort?: string
  },
) => {
  const shouldRequireCategoryId =
    placement === 'CATEGORY_INLINE_COLLECTION' && options?.requireCategoryId !== false
  const hasValidCategoryId =
    typeof options?.categoryId === 'number' &&
    Number.isFinite(options.categoryId) &&
    options.categoryId > 0

  const shouldSkip = Boolean(
    options?.skip || (shouldRequireCategoryId && !hasValidCategoryId),
  )

  const query = useGetResolvedCollectionsQuery(
    {
      placement,
      ...(shouldRequireCategoryId && hasValidCategoryId
        ? { categoryId: options?.categoryId }
        : {}),
      page: options?.page ?? 0,
      size: options?.size ?? 20,
      sort: options?.sort,
      lang: options?.lang,
    },
    { skip: shouldSkip },
  )

  const collections = useMemo(() => {
    const source = [...(query.data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)
    const maxItems = options?.maxItems
    if (!maxItems || maxItems <= 0) return source

    return source.map((collection) => ({
      ...collection,
      products: collection.products.slice(0, maxItems),
    }))
  }, [query.data, options?.maxItems])

  return {
    collections,
    activeCollection: collections[0] ?? null,
    products: collections[0]?.products ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
  }
}
