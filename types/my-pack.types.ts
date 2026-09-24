import type { Address, OrderItemType, OrderStatus, OrderType, PaymentStatus, ShippingStatus, User } from '@prisma/client'
import { SUBSCRIPTION_TIERS } from 'lib/constants/subscriptions.constants'
import { Dispatch, SetStateAction } from 'react'
import { BillingInterval } from './subscriptions.types'

export interface Donation {
  id: string
  amount: number
  createdAt: Date
  status: OrderStatus
}

export interface Subscription {
  id: string
  tierName: string
  amount: number
  interval: BillingInterval
  status: OrderStatus
  nextBillingDate: Date | null
}

export interface MultiItemOrderItem {
  id: string
  name: string
  image: string | null
  iconKey: string | null
  itemType: OrderItemType | null
  price: number
  quantity: number
  isPhysical: boolean
}

export interface MultiItemOrder {
  id: string
  type: OrderType
  totalAmount: number
  createdAt: Date
  status: OrderStatus
  shippingStatus: ShippingStatus | null
  customerName: string | null
  items: MultiItemOrderItem[]
  shippingAddress: {
    addressLine1: string
    addressLine2: string | null
    city: string | null
    state: string | null
    zipPostalCode: string | null
  } | null
}

export interface ParticipationItem {
  auctionItemId: string
  itemName: string
  itemImage: string | null
  myHighestBid: number
  myBidCount: number
  lastBidAt: Date
  itemTotalBids: number
  isWinner: boolean
  status: string
}

export interface AuctionParticipation {
  auctionId: string
  auctionTitle: string
  auctionStatus: string
  auctionEndDate: Date | null
  customAuctionLink: string | null
  myBidCount: number
  paymentLink: string | null
  paymentStatus: string | null
  paidOn: Date | null
  items: ParticipationItem[]
}

export type PackMember = Pick<
  User,
  'id' | 'firstName' | 'lastName' | 'email' | 'phone' | 'anonymousBidding' | 'createdAt' | 'autoPay' | 'autoPayCoverFees' | 'role' | 'image'
> & {
  address: Address | null
}

export type Tier = (typeof SUBSCRIPTION_TIERS)[number]
export type TierId = Tier['id']

export interface SubscriptionSelectorProps {
  billing: BillingInterval
  setBilling: Dispatch<SetStateAction<BillingInterval>>
  selected: TierId | null
  setSelected: (value: TierId | null) => void
}

export interface AuctionPurchase {
  id: string
  auctionId: string
  totalAmount: number
  createdAt: Date
  paymentStatus: PaymentStatus
  items: {
    id: string
    name: string
    image: string | null
  }[]
}

export type MyPackTab = 'account' | 'orders' | 'adoptions' | 'giving' | 'auctions' | 'settings'
