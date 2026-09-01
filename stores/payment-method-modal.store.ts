import { create } from 'zustand'

type PaymentMethodModalState = {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const usePaymentMethodModal = create<PaymentMethodModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false })
}))
