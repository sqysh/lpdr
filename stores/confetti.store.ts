'use client'

import { create } from 'zustand'

type ConfettiState = {
  isActive: boolean
  show: () => void
  hide: () => void
}

export const useConfettiStore = create<ConfettiState>((set) => ({
  isActive: false,
  show: () => set({ isActive: true }),
  hide: () => set({ isActive: false })
}))
