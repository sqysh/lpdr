import { Prisma } from '@prisma/client'
import { TABS } from 'lib/constants/auction.constants'
import { IAuctionAnomaly } from './_auction-anomaly'
import { userContactSelect } from './prisma-selects.types'

export type DecimalToNumber<T> = T extends Prisma.Decimal
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

/** Shared bid field set — excludes internal email-tracking columns. */
export const bidSelect = {
  id: true,
  bidAmount: true,
  auctionId: true,
  auctionItemId: true,
  userId: true,
  bidderId: true,
  status: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.AuctionBidSelect

/** List view — admin auctions table, overview tab. */
export const auctionListArgs = Prisma.validator<Prisma.AuctionDefaultArgs>()({
  include: {
    items: {
      include: { photos: true, instantBuyers: true, _count: { select: { bids: true } } }
    },
    bids: { select: bidSelect },
    bidders: { include: { user: { select: userContactSelect } } },
    instantBuyers: true,
    winningBidders: {
      include: { user: { select: userContactSelect }, auctionItems: true }
    }
  }
})

export type IAuction = DecimalToNumber<Prisma.AuctionGetPayload<typeof auctionListArgs>> & {
  anomalies?: IAuctionAnomaly[]
}

export type Tab = (typeof TABS)[number]['label']

export interface AuctionStartedData {
  auctionId: string
  auctionTitle: string
  itemCount: number
  endDate: string
  customAuctionLink?: string
}

export interface AuctionEndedData {
  auctionTitle: string
  totalRaised: number
  itemCount: number
  bidderCount: number
  customAuctionLink: string
}

/** Detail view — admin auction item page. */
export const auctionItemDetailArgs = Prisma.validator<Prisma.AuctionItemDefaultArgs>()({
  include: {
    photos: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
    bids: {
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { ...userContactSelect, anonymousBidding: true } },
        bidder: { select: { id: true } }
      }
    },
    winningBidder: { include: { user: { select: userContactSelect } } },
    instantBuyers: { include: { user: { select: userContactSelect } } },
    auction: {
      select: {
        id: true,
        title: true,
        status: true,
        startDate: true,
        endDate: true,
        customAuctionLink: true
      }
    }
  }
})

export type IAuctionItemDetail = DecimalToNumber<Prisma.AuctionItemGetPayload<typeof auctionItemDetailArgs>>

/** Detail view — public auction item page. No user relations. */
export const auctionItemPublicArgs = Prisma.validator<Prisma.AuctionItemDefaultArgs>()({
  select: {
    id: true,
    name: true,
    description: true,
    sellingFormat: true,
    status: true,
    startingPrice: true,
    buyNowPrice: true,
    currentPrice: true,
    currentBid: true,
    minimumBid: true,
    soldPrice: true,
    shippingCosts: true,
    requiresShipping: true,
    totalQuantity: true,
    photos: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
    _count: { select: { bids: true } },
    auction: {
      select: {
        id: true,
        title: true,
        status: true,
        startDate: true,
        endDate: true,
        customAuctionLink: true,
        items: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            name: true,
            sellingFormat: true,
            status: true,
            startingPrice: true,
            buyNowPrice: true,
            currentBid: true,
            photos: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
            _count: { select: { bids: true } }
          }
        }
      }
    }
  }
})

export type IAuctionItemPublic = DecimalToNumber<Prisma.AuctionItemGetPayload<typeof auctionItemPublicArgs>>

/** Detail view — admin auction page. */
export const auctionDetailArgs = Prisma.validator<Prisma.AuctionDefaultArgs>()({
  include: {
    items: { orderBy: { createdAt: 'asc' }, include: { photos: true } },
    bidders: {
      include: { user: { select: { ...userContactSelect, anonymousBidding: true } } }
    },
    bids: { orderBy: { createdAt: 'desc' }, select: bidSelect },
    winningBidders: {
      include: { auctionItems: true, user: { select: userContactSelect } }
    },
    instantBuyers: true
  }
})

export type IAuctionDetail = DecimalToNumber<Prisma.AuctionGetPayload<typeof auctionDetailArgs>>
