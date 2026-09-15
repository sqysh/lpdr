'use client'

import { create } from 'zustand'

type AuctionUiState = {
  drawerOpen: boolean
  bidModalOpen: boolean
  signInRedirectTo: string | null
  winningBidderData: unknown | null
  openDrawer: () => void
  closeDrawer: () => void
  openSignInModal: (redirectTo: string) => void
  closeSignInModal: () => void
  openWinningBidderDrawer: (data: unknown) => void
  closeWinningBidderDrawer: () => void
}

export const useAuctionUiStore = create<AuctionUiState>((set) => ({
  drawerOpen: false,
  bidModalOpen: false,
  signInRedirectTo: null,
  winningBidderData: null,
  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
  openSignInModal: (signInRedirectTo) => set({ signInRedirectTo }),
  closeSignInModal: () => set({ signInRedirectTo: null }),
  openWinningBidderDrawer: (winningBidderData) => set({ winningBidderData }),
  closeWinningBidderDrawer: () => set({ winningBidderData: null })
}))
