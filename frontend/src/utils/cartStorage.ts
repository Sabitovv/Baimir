const CART_STORAGE_KEY = 'baymir_cart'

export const readCartStorage = (): unknown => {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const writeCartStorage = (value: unknown): void => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(value))
  } catch {
    // ignore localStorage write errors
  }
}

export const clearCartStorage = (): void => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.removeItem(CART_STORAGE_KEY)
  } catch {
    // ignore localStorage remove errors
  }
}
