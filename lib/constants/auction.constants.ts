import { AuctionStatus } from '@prisma/client'

export const AUCTION_FILTERS: (AuctionStatus | 'ALL')[] = ['ALL', 'DRAFT', 'ACTIVE', 'ENDED']

export const TABS: { label: string; statuses: AuctionStatus[] }[] = [
  { label: 'Overview', statuses: ['DRAFT', 'ACTIVE', 'ENDED'] },
  { label: 'Items', statuses: ['DRAFT', 'ACTIVE', 'ENDED'] },
  { label: 'Settings', statuses: ['DRAFT', 'ACTIVE', 'ENDED'] },
  { label: 'Bidders', statuses: ['ACTIVE', 'ENDED'] },
  { label: 'Winning Bidders', statuses: ['ENDED'] }
]
