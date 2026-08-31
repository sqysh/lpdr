import { Prisma } from '@prisma/client'
import { IAuction } from './_auction'

export type AuctionItemStatus = 'UNSOLD' | 'SOLD' | 'ACTIVE'
export type SellingFormat = 'AUCTION' | 'FIXED'

// Derived directly from what getAuctions() actually returns — Decimal fields
// are already numbers, relations are already shaped correctly, and this
// type can never drift from reality since it's not hand-maintained.
// Use this for list views (admin auctions list, overview tab, etc.)
// where you don't need every bid/instant-buyer loaded per item.
export type IAuctionItem = NonNullable<IAuction['items']>[number]

// ── Live/detail item shape ──────────────────────────────────────────────
// A richer include for pages that need the item's own bids, instant
// buyers, a back-reference to its parent auction, and a bid count —
// used by the auction-live page, item detail view, and public instant-buy
// page. Single source of truth: change the include here, both the query
// and the type update together.
export const auctionItemLiveIncludes = Prisma.validator<Prisma.AuctionItemDefaultArgs>()({
  include: {
    photos: true,
    bids: {
      select: {
        id: true,
        bidAmount: true,
        auctionId: true,
        auctionItemId: true,
        userId: true,
        bidderId: true,
        status: true,
        sentWinnerEmail: true,
        emailCount: true,
        createdAt: true,
        updatedAt: true
      }
    },
    instantBuyers: true,
    auction: {
      select: {
        id: true,
        title: true,
        status: true,
        startDate: true,
        endDate: true,
        customAuctionLink: true
      }
    },
    _count: {
      select: { bids: true }
    }
  }
})

type RawAuctionItemLive = Prisma.AuctionItemGetPayload<typeof auctionItemLiveIncludes>

type DecimalToNumber<T> = T extends Prisma.Decimal
  ? number
  : T extends Prisma.Decimal | null
    ? number | null
    : T extends Date
      ? T
      : T extends (infer U)[]
        ? DecimalToNumber<U>[]
        : T extends object
          ? { [K in keyof T]: DecimalToNumber<T[K]> }
          : T

export type IAuctionItemLive = DecimalToNumber<RawAuctionItemLive>

export interface CreateAuctionItemInput {
  auctionId: string
  name: string
  description?: string
  sellingFormat: SellingFormat
  startingPrice?: number
  buyNowPrice?: number
  totalQuantity?: number
  requiresShipping?: boolean
  shippingCosts?: number
  photos?: any
}

export type UpdateAuctionItemInput = CreateAuctionItemInput

export type IAuctionLive = Omit<IAuction, 'items'> & {
  items: IAuctionItemLive[]
}
