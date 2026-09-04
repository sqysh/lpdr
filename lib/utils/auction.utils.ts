import { AuctionStatus } from '@prisma/client'
import { IAuction } from 'types/auction.types'
import { IAuctionBid } from 'types/_auction-bid'
import { AuctionItemStatus } from 'types/auction-item.types'

export function getItemStatusConfig(status: AuctionItemStatus) {
  switch (status) {
    case 'SOLD':
      return { label: 'Sold', classes: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' }
    case 'ACTIVE':
      return {
        label: 'Active',
        classes:
          'bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark border-primary-light/20 dark:border-primary-dark/20'
      }
    case 'UNSOLD':
      return {
        label: 'Unsold',
        classes:
          'bg-surface-light dark:bg-surface-dark text-muted-light dark:text-muted-dark border-border-light dark:border-border-dark'
      }
  }
}

export function getAuctionStatusConfig(status: AuctionStatus) {
  switch (status) {
    case 'ACTIVE':
      return { label: 'Active', classes: 'bg-emerald-500/10 text-emerald-500' }
    case 'DRAFT':
      return { label: 'Draft', classes: 'bg-amber-500/10 text-amber-500' }
    case 'ENDED':
      return {
        label: 'Ended',
        classes:
          'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark'
      }
  }
}

function calculateIncrementalTotal(bids: IAuction['bids']): number {
  if (!bids || bids.length === 0) return 0

  const bidsByItem = bids.reduce((acc: Record<string, typeof bids>, bid) => {
    const itemId = bid.auctionItemId
    if (!acc[itemId]) acc[itemId] = []
    acc[itemId].push(bid)
    return acc
  }, {})

  let grandTotal = 0

  Object.values(bidsByItem).forEach((itemBids) => {
    const sorted = [...itemBids].sort((a, b) => a.bidAmount - b.bidAmount)
    let itemTotal = 0
    sorted.forEach((bid, i) => {
      itemTotal += i === 0 ? bid.bidAmount : bid.bidAmount - sorted[i - 1].bidAmount
    })
    grandTotal += itemTotal
  })

  return grandTotal
}

export function getDisplayRevenue(auction: IAuction): number {
  if (auction.status === 'ENDED') return auction.totalAuctionRevenue

  const totalFromInstantBuys = auction.instantBuyers?.reduce((acc, item) => acc + (item.totalPrice ?? 0), 0) ?? 0

  return calculateIncrementalTotal(auction.bids) + totalFromInstantBuys
}

export function bidderDisplay(bid: IAuctionBid) {
  if (bid.user.anonymousBidding) return bid.bidderName ?? 'Anonymous'
  return `${bid.user.firstName} ${bid.user.lastName[0]}.`
}

export const AUCTION_MIN_HOUR = 6
export const AUCTION_MAX_HOUR = 22

export function validateAuctionHour(dateTimeLocal: string): string | null {
  if (!dateTimeLocal) return null

  const date = new Date(dateTimeLocal)

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false
  }).formatToParts(date)

  const hour = Number(parts.find((p) => p.type === 'hour')?.value)
  const minutes = Number(parts.find((p) => p.type === 'minute')?.value)

  if (minutes !== 0) {
    return 'Time must be on the hour (e.g. 9:00, not 9:15).'
  }

  if (hour < AUCTION_MIN_HOUR || hour >= AUCTION_MAX_HOUR) {
    return `Time must be between ${AUCTION_MIN_HOUR}:00 AM and ${AUCTION_MAX_HOUR - 12}:00 PM.`
  }

  return null
}

export const AUCTION_HOUR_OPTIONS = Array.from({ length: 17 }, (_, i) => {
  const hour24 = i + 6 // 6am through 10pm
  const label = new Date(2000, 0, 1, hour24).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })
  return { value: hour24, label }
})
