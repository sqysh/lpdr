'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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

type ItemRef = { id: string; size?: string | null }

type CartState = {
  items: CartItem[]
  isCheckingOut: boolean
  lastUpdated: string
  addToCart: (item: CartItem) => void
  incrementQuantity: (ref: ItemRef) => void
  decrementQuantity: (ref: ItemRef) => void
  removeFromCart: (ref: ItemRef) => void
  clearCart: () => void
  setCheckingOut: (value: boolean) => void
}

const STALE_AFTER = 7 * 24 * 60 * 60 * 1000

const matches = (item: CartItem, ref: ItemRef) => item.id === ref.id && item.size === ref.size

const stamp = () => new Date().toISOString()

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isCheckingOut: false,
      lastUpdated: stamp(),

      addToCart: (payload) =>
        set((state) => {
          const existing = state.items.find((i) => matches(i, payload as ItemRef))

          if (!existing) {
            return {
              items: [...state.items, { ...payload, quantity: payload.quantity || 1 }],
              lastUpdated: stamp()
            }
          }

          const next = existing.quantity + (payload.quantity || 1)

          return {
            items: state.items.map((i) =>
              i === existing
                ? {
                    ...i,
                    maxQuantity: payload.maxQuantity,
                    quantity:
                      payload.maxQuantity != null ? Math.min(next, payload.maxQuantity) : next
                  }
                : i
            ),
            lastUpdated: stamp()
          }
        }),

      incrementQuantity: (ref) =>
        set((state) => ({
          items: state.items.map((i) =>
            matches(i, ref) && (i.maxQuantity == null || i.quantity < i.maxQuantity)
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
          lastUpdated: stamp()
        })),

      decrementQuantity: (ref) =>
        set((state) => ({
          items: state.items.map((i) =>
            matches(i, ref) && i.quantity > 1 ? { ...i, quantity: i.quantity - 1 } : i
          ),
          lastUpdated: stamp()
        })),

      removeFromCart: (ref) =>
        set((state) => ({
          items: state.items.filter((i) => !matches(i, ref)),
          lastUpdated: stamp()
        })),

      clearCart: () => set({ items: [], isCheckingOut: false, lastUpdated: stamp() }),

      setCheckingOut: (isCheckingOut) => set({ isCheckingOut })
    }),
    {
      name: 'lpdr-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, lastUpdated: state.lastUpdated }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        const age = Date.now() - new Date(state.lastUpdated).getTime()
        if (age > STALE_AFTER) {
          state.items = []
          state.lastUpdated = stamp()
        }
      }
    }
  )
)
