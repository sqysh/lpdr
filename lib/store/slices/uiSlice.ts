import { createSlice } from '@reduxjs/toolkit'
import { IAuctionItem } from 'types/_auction-item'
import { CartItem } from './cartSlice'
import { IOrder } from 'types/_order.types'

interface UiState {
  confetti: boolean
  navigationDrawer: boolean
  isSpanish: boolean
  mobileNavigation: boolean
  isDark: boolean
  auctionDrawer: boolean
  auctionItemDrawer: boolean
  auctionBidModal: boolean
  auctionItem: IAuctionItem | null
  auctionEndedModal: boolean
  auctionEndedData: any | null
  auctionStartedModal: boolean
  auctionStartedData: any | null
  adminWinningBidderDrawer: boolean
  adminWinningBidderData: any | null
  addPaymentMethodModal: boolean
  welcomeWienerDrawer: boolean
  cartToast: boolean
  item: CartItem | null
  productDrawer: boolean
  orderDrawer: boolean
  order: IOrder | null
  adoptionFeeWelcomeModal: boolean
  adminCreateNewsletterIssueModal: boolean
  contactModal: boolean
  auctionSignInModal: boolean
  auctionSignInRedirectTo: string | null
}

const initialState: UiState = {
  confetti: false,
  navigationDrawer: false,
  isSpanish: false,
  mobileNavigation: false,
  isDark: false,
  auctionDrawer: false,
  auctionItemDrawer: false,
  auctionBidModal: false,
  auctionItem: null,
  auctionEndedModal: false,
  auctionEndedData: null,
  auctionStartedModal: false,
  auctionStartedData: null,
  adminWinningBidderDrawer: false,
  adminWinningBidderData: null,
  addPaymentMethodModal: false,
  welcomeWienerDrawer: false,
  cartToast: false,
  item: null,
  productDrawer: false,
  orderDrawer: false,
  order: null,
  adoptionFeeWelcomeModal: false,
  adminCreateNewsletterIssueModal: false,
  contactModal: false,
  auctionSignInModal: false,
  auctionSignInRedirectTo: null
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setShowConfetti: (state) => {
      state.confetti = true
    },
    setHideConfetti: (state) => {
      state.confetti = false
    },
    setOpenNavigationDrawer: (state) => {
      state.navigationDrawer = true
    },
    setCloseNavigationDrawer: (state) => {
      state.navigationDrawer = false
    },
    toggleNavigationDrawer: (state) => {
      state.navigationDrawer = !state.navigationDrawer
    },
    setIsSpanish: (state) => {
      state.isSpanish = true
    },
    setIsNotSpanish: (state) => {
      state.isSpanish = false
    },
    setOpenMobileNavigation: (state) => {
      state.mobileNavigation = true
    },
    setCloseMobileNavigation: (state) => {
      state.mobileNavigation = false
    },
    setIsDark: (state, { payload }) => {
      state.isDark = payload
    },
    setOpenAuctionDrawer: (state) => {
      state.auctionDrawer = true
    },
    setCloseAuctionDrawer: (state) => {
      state.auctionDrawer = false
    },
    // setOpenAuctionItemDrawer: (state) => {
    //   state.auctionItemDrawer = true
    // },
    // setCloseAuctionItemDrawer: (state) => {
    //   state.auctionItemDrawer = false
    // },
    setOpenAuctionBidModal: (state, { payload }) => {
      state.auctionBidModal = true
      state.auctionItem = payload
    },
    setCloseAuctionBidModal: (state) => {
      state.auctionBidModal = false
      state.auctionItem = null
    },
    setOpenAuctionEndedModal: (state, { payload }) => {
      state.auctionEndedModal = true
      state.auctionEndedData = payload
    },
    setCloseAuctionEndedModal: (state) => {
      state.auctionEndedModal = false
      state.auctionEndedData = null
    },
    setOpenAuctionStartedModal: (state, { payload }) => {
      state.auctionStartedModal = true
      state.auctionStartedData = payload
    },
    setCloseAuctionStartedModal: (state) => {
      state.auctionStartedModal = false
      state.auctionStartedData = null
    },
    setOpenWinningBidderDrawer: (state, { payload }) => {
      state.adminWinningBidderDrawer = true
      state.adminWinningBidderData = payload
    },
    setCloseWinningBidderDrawer: (state) => {
      state.adminWinningBidderDrawer = false
      state.adminWinningBidderData = null
    },
    setOpenAddPaymentMethodModal: (state) => {
      state.addPaymentMethodModal = true
    },
    setCloseAddPaymentMethodModal: (state) => {
      state.addPaymentMethodModal = false
    },
    // setOpenWelcomeWienerDrawer: (state) => {
    //   state.welcomeWienerDrawer = true
    // },
    // setCloseWelcomeWienerDrawer: (state) => {
    //   state.welcomeWienerDrawer = false
    // },
    setOpenCartToast: (state, { payload }) => {
      state.cartToast = true
      state.item = payload
    },
    setCloseCartToast: (state) => {
      state.cartToast = false
      state.item = null
    },
    // setOpenProductDrawer: (state) => {
    //   state.productDrawer = true
    // },
    // setCloseProductDrawer: (state) => {
    //   state.productDrawer = false
    // },
    // setOpenOrderDrawer: (state, { payload }) => {
    //   state.orderDrawer = true
    //   state.order = payload
    // },
    // setCloseOrderDrawer: (state) => {
    //   state.orderDrawer = false
    //   state.order = null
    // },
    setOpenAdoptionFeeWelcomeModal: (state) => {
      state.adoptionFeeWelcomeModal = true
    },
    setCloseAdoptionFeeWelcomeModal: (state) => {
      state.adoptionFeeWelcomeModal = false
    },
    // setOpenCreateAdminNewsletterIssueModal: (state) => {
    //   state.adminCreateNewsletterIssueModal = true
    // },
    // setCloseCreateAdminNewsletterIssueModal: (state) => {
    //   state.adminCreateNewsletterIssueModal = false
    // },
    setOpenContactModal: (state) => {
      state.contactModal = true
    },
    setCloseContactModal: (state) => {
      state.contactModal = false
    },
    setOpenAuctionSignInModal: (state, { payload }) => {
      state.auctionSignInModal = true
      state.auctionSignInRedirectTo = payload
    },
    setCloseAuctionSignInModal: (state) => {
      state.auctionSignInModal = false
      state.auctionSignInRedirectTo = null
    }
  }
})

export const {
  setShowConfetti,
  setHideConfetti,
  setCloseNavigationDrawer,
  setOpenNavigationDrawer,
  setIsNotSpanish,
  setIsSpanish,
  setCloseMobileNavigation,
  setOpenMobileNavigation,
  toggleNavigationDrawer,
  setIsDark,
  setCloseAuctionDrawer,
  setOpenAuctionDrawer,
  // setCloseAuctionItemDrawer,
  // setOpenAuctionItemDrawer,
  setCloseAuctionBidModal,
  setOpenAuctionBidModal,
  setCloseAuctionEndedModal,
  setOpenAuctionEndedModal,
  setCloseWinningBidderDrawer,
  setOpenWinningBidderDrawer,
  setCloseAddPaymentMethodModal,
  setOpenAddPaymentMethodModal,
  // setCloseWelcomeWienerDrawer,
  // setOpenWelcomeWienerDrawer,
  setCloseCartToast,
  setOpenCartToast,
  // setOpenProductDrawer,
  // setCloseProductDrawer,
  // setCloseOrderDrawer,
  // setOpenOrderDrawer,
  setCloseAdoptionFeeWelcomeModal,
  setOpenAdoptionFeeWelcomeModal,
  // setCloseCreateAdminNewsletterIssueModal,
  // setOpenCreateAdminNewsletterIssueModal,
  setCloseContactModal,
  setOpenContactModal,
  setCloseAuctionStartedModal,
  setOpenAuctionStartedModal,
  setCloseAuctionSignInModal,
  setOpenAuctionSignInModal
} = uiSlice.actions

export const uiReducer = uiSlice.reducer
