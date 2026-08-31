import { TABS } from 'lib/constants/auction.constants'
import { IAuctionAnomaly } from './_auction-anomaly'
import { IAuctionBid } from './_auction-bid'
import { IAuctionBidder } from './_auction-bidder'
import { IAuctionItemInstantBuyer } from './_auction-instant-buyer'
import { IAuctionItem } from './_auction-item'
import { IAuctionWinningBidder } from './_auction-winning-bidder'
import { IUser } from './_user'

export type AuctionStatus = 'DRAFT' | 'ACTIVE' | 'ENDED'

export interface IAuction {
  historicalBidderCount: number
  historicalBidCount: number
  historicalItemCount: number
  bids?: IAuctionBid[]
  items?: IAuctionItem[]
  bidders?: IAuctionBidder[]
  instantBuyers?: IAuctionItemInstantBuyer[]
  winningBidders?: IAuctionWinningBidder[]
  anomalies?: IAuctionAnomaly[]
  id: string
  title: string
  status: AuctionStatus
  goal: number
  totalAuctionRevenue: number
  supporters: number
  supporterEmails: string[]
  customAuctionLink?: string | null
  startDate: Date
  endDate: Date
  createdAt: Date
  updatedAt: Date
  user?: IUser
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
