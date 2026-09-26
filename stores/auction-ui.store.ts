'use client'

import { create } from 'zustand'

export type SignInReason = 'bid' | 'buy' | 'watch'

type AuctionUiState = {
  signInRedirectTo: string | null
  signInReason: SignInReason
  openSignInModal: (redirectTo: string, reason?: SignInReason) => void
  closeSignInModal: () => void
}

export const useAuctionUiStore = create<AuctionUiState>((set) => ({
  signInRedirectTo: null,
  signInReason: 'bid',
  openSignInModal: (redirectTo, reason = 'bid') => set({ signInRedirectTo: redirectTo, signInReason: reason }),
  closeSignInModal: () => set({ signInRedirectTo: null })
}))
