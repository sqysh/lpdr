import { AuctionStatus } from '@prisma/client'

export const AUCTION_STATUS_FILTERS: (AuctionStatus | 'ALL')[] = ['ALL', 'DRAFT', 'ACTIVE', 'ENDED']

export const TABS = [
  { label: 'Overview', statuses: ['DRAFT', 'ACTIVE', 'ENDED'] },
  { label: 'Items', statuses: ['DRAFT', 'ACTIVE', 'ENDED'] },
  { label: 'Settings', statuses: ['DRAFT', 'ACTIVE', 'ENDED'] },
  { label: 'Bidders', statuses: ['ACTIVE', 'ENDED'] },
  { label: 'Winning Bidders', statuses: ['ENDED'] }
] as const satisfies readonly { label: string; statuses: readonly AuctionStatus[] }[]

/** 'Overview' | 'Items' | 'Settings' | 'Bidders' | 'Winning Bidders' */
export type AuctionTab = (typeof TABS)[number]['label']
