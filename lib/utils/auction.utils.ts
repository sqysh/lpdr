import { AuctionStatus } from '@prisma/client'
import { BidStatus } from 'types/auction-bid'
import { PublicAuction } from 'types/auction.types'
import { AuctionItemStatus } from 'types/auction.types'

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
        classes: 'bg-surface-light dark:bg-surface-dark text-muted-light dark:text-muted-dark border-border-light dark:border-border-dark'
      }
  }
}

export function getAuctionStatusConfig(status: AuctionStatus) {
  switch (status) {
    case 'ACTIVE':
      return {
        label: 'Bidding open',
        description: 'People can bid and buy right now',
        dotClass: 'bg-emerald-500 animate-pulse',
        textClass: 'text-emerald-500',
        classes: 'bg-emerald-500/10 text-emerald-500'
      }
    case 'DRAFT':
      return {
        label: 'Not started',
        description: 'Nobody can bid yet',
        dotClass: 'bg-amber-500',
        textClass: 'text-amber-600 dark:text-amber-400',
        classes: 'bg-amber-500/10 text-amber-500'
      }
    case 'ENDED':
      return {
        label: 'Finished',
        description: 'Bidding is closed',
        dotClass: 'bg-muted-light dark:bg-muted-dark',
        textClass: 'text-muted-light dark:text-muted-dark',
        classes:
          'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark'
      }
  }
}

function calculateIncrementalTotal(bids: { auctionItemId: string; bidAmount: number }[]): number {
  const highestByItem = bids.reduce<Record<string, number>>((acc, bid) => {
    acc[bid.auctionItemId] = Math.max(acc[bid.auctionItemId] ?? 0, bid.bidAmount)
    return acc
  }, {})

  return Object.values(highestByItem).reduce((sum, amount) => sum + amount, 0)
}

export function getDisplayRevenue(auction: {
  status: AuctionStatus
  totalAuctionRevenue: number
  instantBuyers?: { totalPrice: number | null }[]
  bids: { auctionItemId: string; bidAmount: number; status: BidStatus }[]
}): number {
  if (auction.status === 'ENDED') return auction.totalAuctionRevenue

  const totalFromInstantBuys = auction.instantBuyers?.reduce((acc, item) => acc + (item.totalPrice ?? 0), 0) ?? 0

  return calculateIncrementalTotal(auction.bids) + totalFromInstantBuys
}

export function bidderDisplay(bid: { user: { anonymousBidding: boolean; firstName: string | null; lastName: string | null } }): string {
  if (bid.user.anonymousBidding) return 'Anonymous'

  const first = bid.user.firstName?.trim()
  const initial = bid.user.lastName?.trim()?.[0]

  if (!first) return 'A supporter'
  return initial ? `${first} ${initial}.` : first
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
