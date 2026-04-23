const RECENTLY_VIEWED_STORAGE_KEY = 'baymir_recently_viewed_products'
const MAX_RECENTLY_VIEWED_PRODUCTS = 12

const normalizeIds = (value: unknown): number[] => {
  if (!Array.isArray(value)) return []

  const seen = new Set<number>()
  const normalized: number[] = []

  value.forEach((item) => {
    const num = typeof item === 'number' ? item : Number(item)
    if (!Number.isInteger(num) || num <= 0 || seen.has(num)) return
    seen.add(num)
    normalized.push(num)
  })

  return normalized
}

export const readRecentlyViewedProductIds = (): number[] => {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY)
    if (!raw) return []
    return normalizeIds(JSON.parse(raw))
  } catch {
    return []
  }
}

export const writeRecentlyViewedProductIds = (ids: number[]): void => {
  if (typeof window === 'undefined') return

  try {
    const normalized = normalizeIds(ids).slice(0, MAX_RECENTLY_VIEWED_PRODUCTS)
    window.localStorage.setItem(
      RECENTLY_VIEWED_STORAGE_KEY,
      JSON.stringify(normalized),
    )
  } catch {
    // ignore localStorage write errors
  }
}

export const addRecentlyViewedProductId = (id: number): void => {
  if (!Number.isInteger(id) || id <= 0) return

  const current = readRecentlyViewedProductIds()
  const next = [id, ...current.filter((item) => item !== id)].slice(
    0,
    MAX_RECENTLY_VIEWED_PRODUCTS,
  )

  writeRecentlyViewedProductIds(next)
}
