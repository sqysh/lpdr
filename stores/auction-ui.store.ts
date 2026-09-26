'use client'

import { create } from 'zustand'

export type SignInReason = 'bid' | 'buy' | 'watch'

type AuctionUiState = {
  drawerOpen: boolean
  bidModalOpen: boolean
  signInRedirectTo: string | null
  winningBidderData: unknown | null
  openDrawer: () => void
  closeDrawer: () => void
  signInReason: SignInReason
  openSignInModal: (redirectTo: string, reason?: SignInReason) => void
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
  signInReason: 'bid',
  openSignInModal: (redirectTo, reason = 'bid') => set({ signInRedirectTo: redirectTo, signInReason: reason }),
  closeSignInModal: () => set({ signInRedirectTo: null }),
  openWinningBidderDrawer: (winningBidderData) => set({ winningBidderData }),
  closeWinningBidderDrawer: () => set({ winningBidderData: null })
}))
