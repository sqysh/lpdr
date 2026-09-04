import { Prisma } from '@prisma/client'
import { DecimalToNumber, IAuction, bidSelect } from './auction.types'
import { userPublicSelect } from './prisma-selects.types'

export type { AuctionItemStatus, SellingFormat } from '@prisma/client'

/** List-view item shape, derived from the auction list query. */
export type IAuctionItem = NonNullable<IAuction['items']>[number]

/** Richer item include for detail pages: own bids, instant buyers, parent auction. */
export const auctionItemLiveInclude = {
  photos: true,
  bids: { select: bidSelect },
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
  _count: { select: { bids: true } }
} satisfies Prisma.AuctionItemInclude

export const auctionItemLiveArgs = Prisma.validator<Prisma.AuctionItemDefaultArgs>()({
  include: auctionItemLiveInclude
})

export type IAuctionItemLive = DecimalToNumber<Prisma.AuctionItemGetPayload<typeof auctionItemLiveArgs>>

/** Public auction detail page — live items, public-safe user fields. */
export const auctionLiveArgs = Prisma.validator<Prisma.AuctionDefaultArgs>()({
  include: {
    items: { orderBy: { createdAt: 'asc' }, include: auctionItemLiveInclude },
    bidders: { include: { user: { select: userPublicSelect } } },
    bids: { orderBy: { createdAt: 'desc' }, select: bidSelect },
    winningBidders: {
      include: { user: { select: userPublicSelect }, auctionItems: true }
    },
    instantBuyers: true
  }
})

export type IAuctionLive = DecimalToNumber<Prisma.AuctionGetPayload<typeof auctionLiveArgs>>
