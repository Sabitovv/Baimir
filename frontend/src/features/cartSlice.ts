import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { readCartStorage } from '@/utils/cartStorage'

export type CartItem = {
    id: number
    slug: string
    name: string
    image: string
    price?: number
    oldPrice?: number | null
    quantity: number
    inStock?: boolean
}

type CartState = {
    items: CartItem[]
}

type AddToCartPayload = Omit<CartItem, 'quantity'> & { quantity?: number }

const isCartItem = (value: unknown): value is CartItem => {
    if (!value || typeof value !== 'object') return false

    const item = value as Partial<CartItem>
    return (
        typeof item.id === 'number' &&
        typeof item.slug === 'string' &&
        typeof item.name === 'string' &&
        typeof item.image === 'string' &&
        (item.price === undefined || typeof item.price === 'number') &&
        typeof item.quantity === 'number'
    )
}

const loadInitialItems = (): CartItem[] => {
    const raw = readCartStorage()
    if (!Array.isArray(raw)) return []
    return raw.filter(isCartItem).map((item) => ({
        ...item,
        quantity: Math.max(1, Math.floor(item.quantity)),
    }))
}

const initialState: CartState = {
  items: loadInitialItems(),
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    hydrateCart(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload
    },
    addToCart(state, action: PayloadAction<AddToCartPayload>) {
      const quantity = Math.max(1, Math.floor(action.payload.quantity ?? 1))
      const existing = state.items.find((item) => item.id === action.payload.id)

      if (existing) {
        existing.quantity += quantity
        return
      }

      state.items.push({
        ...action.payload,
        quantity,
      })
    },
    incrementQuantity(state, action: PayloadAction<number>) {
      const target = state.items.find((item) => item.id === action.payload)
      if (!target) return
      target.quantity += 1
    },
    decrementQuantity(state, action: PayloadAction<number>) {
      const target = state.items.find((item) => item.id === action.payload)
      if (!target) return
      target.quantity = Math.max(1, target.quantity - 1)
    },
    removeFromCart(state, action: PayloadAction<number>) {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    clearCart(state) {
      state.items = []
    },
  },
})

export const {
  hydrateCart,
  addToCart,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions

export default cartSlice.reducer
