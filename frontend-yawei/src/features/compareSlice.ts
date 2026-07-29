import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { readCompareStorage } from '@/utils/compareStorage'

export type CompareItem = {
  id: number
  slug: string
  name: string
  image: string
  price: number | string
  categoryId: number
  categoryName: string
}

type CompareState = {
  items: CompareItem[]
}

const isCompareItem = (value: unknown): value is CompareItem => {
  if (!value || typeof value !== 'object') return false

  const item = value as Partial<CompareItem>
  return (
    typeof item.id === 'number' &&
    typeof item.slug === 'string' &&
    typeof item.name === 'string' &&
    typeof item.image === 'string' &&
    typeof item.price === 'number' &&
    typeof item.categoryId === 'number' &&
    typeof item.categoryName === 'string'
  )
}

const loadInitialItems = (): CompareItem[] => {
  const raw = readCompareStorage()
  if (!Array.isArray(raw)) return []

  return raw.filter(isCompareItem)
}

const initialState: CompareState = {
  items: loadInitialItems(),
}

const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    hydrateCompare(state, action: PayloadAction<CompareItem[]>) {
      state.items = action.payload
    },
    addToCompare(state, action: PayloadAction<CompareItem>) {
      const exists = state.items.some((item) => item.id === action.payload.id)
      if (exists) return

      state.items.push(action.payload)
    },
    removeFromCompare(state, action: PayloadAction<number>) {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    clearCompare(state) {
      state.items = []
    },
  },
})

export const { hydrateCompare, addToCompare, removeFromCompare, clearCompare } = compareSlice.actions

export default compareSlice.reducer
