import { Prisma } from '@prisma/client'
import { TABS } from 'lib/constants/auction.constants'
import { bidSelect, userContactSelect, userPublicSelect } from './prisma-selects.types'
import { DecimalToNumber } from './prisma.types'
import { IAuctionAnomaly } from './auction-anomaly'

export type { AuctionItemStatus, SellingFormat, AuctionStatus } from '@prisma/client'

// ─── Shared selects ───────────────────────────────────────────────────────

/** Parent auction header — safe on any page. */
const auctionHeaderSelect = {
  id: true,
  title: true,
  status: true,
  startDate: true,
  endDate: true,
  customAuctionLink: true,
  isPubliclyVisible: true
} satisfies Prisma.AuctionSelect

/** Photos in display order, primary first. */
const photosOrdered = { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] } satisfies Prisma.AuctionItem$photosArgs

// ─── Public: auction detail page ──────────────────────────────────────────

/** Item include for public pages: own bids, instant buyers, parent auction. */
export const auctionItemLiveInclude = {
  photos: true,
  bids: { orderBy: { createdAt: 'desc' }, select: bidSelect },
  instantBuyers: true,
  auction: {
    select: {
      ...auctionHeaderSelect,
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
          photos: photosOrdered,
          _count: { select: { bids: true } }
        }
      }
    }
  },
  _count: { select: { bids: true } }
} satisfies Prisma.AuctionItemInclude

export const auctionItemLiveArgs = Prisma.validator<Prisma.AuctionItemDefaultArgs>()({
  include: auctionItemLiveInclude
})

export type IAuctionItemLive = DecimalToNumber<Prisma.AuctionItemGetPayload<typeof auctionItemLiveArgs>>

export type PublicBid = Omit<IAuctionItemLive['bids'][number], 'user'> & { displayName: string }

export type PublicAuctionItem = Omit<IAuctionItemLive, 'bids'> & { bids: PublicBid[] }

/** An item as it appears inside the public auction, same bid treatment. */
export type PublicAuctionListItem = Omit<IAuctionLive['items'][number], 'bids'> & { bids: PublicBid[] }

/** The auction and its items as the grid page receives them. */
export type PublicAuction = Omit<IAuctionLive, 'items' | 'bids'> & {
  items: PublicAuctionListItem[]
  bids: PublicBid[]
}

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

// ─── Admin: auctions list and detail ──────────────────────────────────────

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

/** List-view item shape, derived from the auction list query. */
export type IAuctionItem = NonNullable<IAuction['items']>[number]

/** Detail view — admin auction page. */
export const auctionDetailArgs = Prisma.validator<Prisma.AuctionDefaultArgs>()({
  include: {
    items: {
      orderBy: { createdAt: 'asc' },
      include: { photos: true, instantBuyers: true, _count: { select: { bids: true } } }
    },
    bidders: { include: { user: { select: userContactSelect } } },
    bids: { orderBy: { createdAt: 'desc' }, select: bidSelect },
    winningBidders: {
      include: { auctionItems: true, user: { select: userContactSelect } }
    },
    instantBuyers: true
  }
})

export type IAuctionDetail = DecimalToNumber<Prisma.AuctionGetPayload<typeof auctionDetailArgs>>

/** Detail view — admin auction item page. Includes bidder emails. */
export const auctionItemDetailArgs = Prisma.validator<Prisma.AuctionItemDefaultArgs>()({
  include: {
    photos: photosOrdered,
    bids: {
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: userContactSelect },
        bidder: { select: { id: true } }
      }
    },
    winningBidder: { include: { user: { select: userContactSelect } } },
    instantBuyers: { include: { user: { select: userContactSelect } } },
    auction: { select: auctionHeaderSelect }
  }
})

export type IAuctionItemDetail = DecimalToNumber<Prisma.AuctionItemGetPayload<typeof auctionItemDetailArgs>>

export type AuctionTab = (typeof TABS)[number]['label']

// ─── Winner payment page ──────────────────────────────────────────────────

/** What the winner payment page loads: the row, its items with photos, and who to bill. */
export const auctionWinningBidderArgs = Prisma.validator<Prisma.AuctionWinningBidderDefaultArgs>()({
  include: {
    auction: { select: { id: true, title: true, customAuctionLink: true } },
    user: { select: { id: true, firstName: true, lastName: true, email: true, address: true } },
    auctionItems: {
      include: { photos: photosOrdered }
    }
  }
})

export type IAuctionWinningBidder = DecimalToNumber<Prisma.AuctionWinningBidderGetPayload<typeof auctionWinningBidderArgs>>
