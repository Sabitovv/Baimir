const COMPARE_STORAGE_KEY = 'baymir_compare'

export const readCompareStorage = (): unknown => {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(COMPARE_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const writeCompareStorage = (value: unknown): void => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(value))
  } catch {
    // ignore localStorage write errors
  }
}

export const clearCompareStorage = (): void => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.removeItem(COMPARE_STORAGE_KEY)
  } catch {
    // ignore localStorage remove errors
  }
}
