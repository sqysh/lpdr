'use client'

import { create } from 'zustand'

type ConfettiState = {
  isActive: boolean
  burstTrigger: number
  show: () => void
  hide: () => void
  burst: () => void
}

export const useConfettiStore = create<ConfettiState>((set) => ({
  isActive: false,
  burstTrigger: 0,
  show: () => set({ isActive: true }),
  hide: () => set({ isActive: false }),
  burst: () => set((s) => ({ burstTrigger: s.burstTrigger + 1 }))
}))
