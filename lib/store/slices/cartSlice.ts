import { Reducer, createSlice } from '@reduxjs/toolkit'

export interface CartItem {
  id?: string
  welcomeWienerId?: string
  feedAFosterId?: string
  name: string
  image?: string | null
  price: number
  quantity: number
  isPhysicalProduct: boolean
  shippingPrice?: number
  size?: string | null
  maxQuantity?: number
  iconKey?: string
}

interface CartState {
  items: CartItem[]
  isCheckingOut: boolean
  lastUpdated: string
}

const initialCartState: CartState = {
  items: [],
  isCheckingOut: false,
  lastUpdated: new Date().toISOString()
}

export const cartSlice = createSlice({
  name: 'cart',
  initialState: initialCartState,
  reducers: {
    addToCart: (state, { payload }: { payload: CartItem }) => {
      const existing = state.items.find((item) => item.id === payload.id && item.size === payload.size)
      if (existing) {
        existing.maxQuantity = payload.maxQuantity // refresh the snapshot
        const next = existing.quantity + (payload.quantity || 1)
        existing.quantity = payload.maxQuantity != null ? Math.min(next, payload.maxQuantity) : next
      } else {
        state.items.push({ ...payload, quantity: payload.quantity || 1 })
      }
      state.lastUpdated = new Date().toISOString()
    },

    incrementQuantity: (state, { payload }: { payload: { id: string; size?: string | null } }) => {
      const item = state.items.find((i) => i.id === payload.id && i.size === payload.size)
      if (item && (item.maxQuantity == null || item.quantity < item.maxQuantity)) {
        item.quantity += 1
        state.lastUpdated = new Date().toISOString()
      }
    },
    removeFromCart: (state, { payload }: { payload: { id: string; size?: string | null } }) => {
      state.items = state.items.filter((item) => !(item.id === payload.id && item.size === payload.size))
      state.lastUpdated = new Date().toISOString()
    },

    clearCart: (state) => {
      state.items = []
      state.isCheckingOut = false
      state.lastUpdated = new Date().toISOString()
    },

    decrementQuantity: (state, { payload }: { payload: { id: string; size?: string | null } }) => {
      const item = state.items.find((i) => i.id === payload.id && i.size === payload.size)
      if (item && item.quantity > 1) {
        item.quantity -= 1
        state.lastUpdated = new Date().toISOString()
      }
    },

    hydrateCart: (state, { payload }: { payload: { items: CartItem[]; lastUpdated: string } }) => {
      // ignore stale carts (7 days) — prices/stock will have drifted
      const age = Date.now() - new Date(payload.lastUpdated).getTime()
      if (age > 7 * 24 * 60 * 60 * 1000) return
      state.items = payload.items ?? []
      state.lastUpdated = payload.lastUpdated
    }
  }
})

export const { addToCart, removeFromCart, clearCart, decrementQuantity, incrementQuantity, hydrateCart } =
  cartSlice.actions

export const cartReducer = cartSlice.reducer as Reducer
