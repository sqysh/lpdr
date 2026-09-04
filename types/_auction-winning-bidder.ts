import { PaymentStatus, ShippingStatus, WinningBidPaymentStatus } from '@prisma/client'
import { IAuctionItem } from './auction-item.types'
import { IUser } from './_user'
import { IAuction } from './auction.types'

export interface IAuctionWinningBidder {
  id: string
  auctionId: string
  userId: string
  winningBidPaymentStatus: WinningBidPaymentStatus
  auctionItemPaymentStatus: PaymentStatus
  auctionPaymentNotificationEmailHasBeenSent: boolean
  emailNotificationCount: number
  elapsedTimeSinceAuctionItemWon?: string | null
  processingFee?: number | null
  totalPrice?: number | null
  itemSoldPrice?: number | null
  shipping?: number | null
  shippingStatus: ShippingStatus
  shippingProvider?: string | null
  trackingNumber?: string | null
  paidOn?: Date | null
  createdAt: Date
  updatedAt: Date

  auctionItems?: IAuctionItem[]
  user: IUser
  auction?: IAuction
}
