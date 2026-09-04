import { PaymentStatus, ShippingStatus } from '@prisma/client'

export interface IAuctionItemInstantBuyer {
  id: string
  auctionId: string
  auctionItemId: string
  userId: string
  name?: string | null
  email?: string | null
  totalPrice?: number | null
  paymentStatus: PaymentStatus
  shippingStatus: ShippingStatus
  shippingProvider?: string | null
  trackingNumber?: string | null
  createdAt: Date
  updatedAt: Date
}
