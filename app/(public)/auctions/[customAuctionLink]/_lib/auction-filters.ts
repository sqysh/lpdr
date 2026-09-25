import type { PublicAuctionListItem } from 'types/auction.types'
import type { MyBid } from 'lib/actions/public/auction/getMyBidsForAuction'

export const AUCTION_FILTERS = ['ALL', 'MY BIDS', 'WINNING', 'OUTBID', 'NO BIDS', 'AUCTION', 'FIXED'] as const
export type AuctionFilter = (typeof AUCTION_FILTERS)[number]

export const AUCTION_FILTER_LABELS: Record<AuctionFilter, string> = {
  ALL: 'All',
  'MY BIDS': 'My bids',
  WINNING: 'Winning',
  OUTBID: 'Outbid',
  'NO BIDS': 'No bids',
  AUCTION: 'Auction',
  FIXED: 'Buy Now'
}

export const EMPTY_MESSAGE: Partial<Record<AuctionFilter, string>> = {
  'MY BIDS': "You haven't bid on anything yet.",
  WINNING: "You're not the top bid on anything right now.",
  OUTBID: "You haven't been outbid on anything.",
  'NO BIDS': 'Every item has at least one bid.'
}

/** One definition of each filter, so the list and the counts on the buttons can't disagree. */
export function matchesFilter(item: PublicAuctionListItem, filter: AuctionFilter, myBids: Record<string, MyBid>) {
  const mine = myBids[item.id]

  switch (filter) {
    case 'ALL':
      return true
    case 'MY BIDS':
      return !!mine
    case 'WINNING':
      return mine?.status === 'TOP_BID'
    case 'OUTBID':
      return !!mine && mine.status !== 'TOP_BID'
    case 'NO BIDS':
      return item._count?.bids === 0 && item.sellingFormat !== 'FIXED'
    default:
      return item.sellingFormat === filter
  }
}
