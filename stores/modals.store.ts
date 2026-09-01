'use client'

import { create } from 'zustand'
import type { CartItem } from './cart.store'

type ModalsState = {
  contactOpen: boolean
  cartToastItem: CartItem | null
  openContact: () => void
  closeContact: () => void
  showCartToast: (item: CartItem) => void
  hideCartToast: () => void
}

export const useModalsStore = create<ModalsState>((set) => ({
  contactOpen: false,
  cartToastItem: null,
  openContact: () => set({ contactOpen: true }),
  closeContact: () => set({ contactOpen: false }),
  showCartToast: (cartToastItem) => set({ cartToastItem }),
  hideCartToast: () => set({ cartToastItem: null })
}))
