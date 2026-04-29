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
  },
) => {
  const query = useGetResolvedCollectionsQuery(
    { lang: options?.lang },
    { skip: options?.skip },
  )

  const collections = useMemo(() => {
    const source = (query.data ?? [])
      .filter((collection) => collection.placements.includes(placement))
      .sort((a, b) => a.sortOrder - b.sortOrder)
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
