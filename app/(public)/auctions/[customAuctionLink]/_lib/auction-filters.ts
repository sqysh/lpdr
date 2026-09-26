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

export const AUCTION_SORTS = ['DEFAULT', 'PRICE_LOW', 'PRICE_HIGH', 'MOST_BIDS'] as const
export type AuctionSort = (typeof AUCTION_SORTS)[number]

export const AUCTION_SORT_LABELS: Record<AuctionSort, string> = {
  DEFAULT: 'Featured',
  PRICE_LOW: 'Price: low to high',
  PRICE_HIGH: 'Price: high to low',
  MOST_BIDS: 'Most bids'
}

// What someone would pay now: the current bid, or the starting price before any bids, or the Buy Now price
const priceOf = (item: PublicAuctionListItem) =>
  Number(item.sellingFormat === 'FIXED' ? (item.buyNowPrice ?? 0) : (item.currentBid ?? item.startingPrice ?? 0))

/** Returns a sorted copy. Featured keeps the order the crew set the items up in. */
export function sortItems(items: PublicAuctionListItem[], sort: AuctionSort) {
  if (sort === 'DEFAULT') return items

  return [...items].sort((a, b) => {
    if (sort === 'PRICE_LOW') return priceOf(a) - priceOf(b)
    if (sort === 'PRICE_HIGH') return priceOf(b) - priceOf(a)
    // Ties fall back to the higher price, so the busiest, most valuable items lead
    return (b._count?.bids ?? 0) - (a._count?.bids ?? 0) || priceOf(b) - priceOf(a)
  })
}
