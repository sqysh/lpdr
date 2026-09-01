'use client'

import { create } from 'zustand'

type NavigationState = {
  mobileNavOpen: boolean
  openMobileNav: () => void
  closeMobileNav: () => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
  mobileNavOpen: false,
  openMobileNav: () => set({ mobileNavOpen: true }),
  closeMobileNav: () => set({ mobileNavOpen: false })
}))
