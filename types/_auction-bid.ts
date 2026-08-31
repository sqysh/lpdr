import { Decimal } from '@prisma/client/runtime/client'

export type BidStatus = 'TOP_BID' | 'OUTBID'

export interface IAuctionBid {
  id: string
  auctionId: string
  auctionItemId: string
  userId: string
  bidderId: string
  bidAmount: number
  bidderName?: string | null
  email?: string | null
  status: BidStatus
  sentWinnerEmail: boolean
  emailCount: number
  createdAt: Date
  updatedAt: Date

  user?: {
    id?: string
    firstName?: string
    lastName?: string
    email?: string
    anonymousBidding?: boolean
  }
  bidder?: {
    id: string
  }
}

export interface IBidModalProps {
  isOpen: boolean
  onClose: () => void
  itemName: string
  currentBid?: number | null
  startingPrice?: number | null
  minimumBid?: number | null
  itemId: string
  auctionId: string
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
  } | null
}

export type PreviousTopBid = {
  userId: string
  bidAmount: Decimal
  user: {
    email: string
    firstName: string | null
  }
} | null
