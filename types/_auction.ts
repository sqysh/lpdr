import { Prisma } from '@prisma/client'
import { TABS } from 'lib/constants/auction.constants'
import { IAuctionAnomaly } from './_auction-anomaly'

export const auctionWithRelations = Prisma.validator<Prisma.AuctionDefaultArgs>()({
  include: {
    items: { include: { photos: true, instantBuyers: true, _count: { select: { bids: true } } } },
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
    bidders: {
      include: { user: true }
    },
    instantBuyers: true,
    winningBidders: {
      include: { user: true, auctionItems: true }
    }
  }
})

type RawAuction = Prisma.AuctionGetPayload<typeof auctionWithRelations>

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

export type IAuction = DecimalToNumber<RawAuction> & {
  historicalBidderCount: number
  historicalBidCount: number
  historicalItemCount: number
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
