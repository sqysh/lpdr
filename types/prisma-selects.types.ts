import { Prisma } from '@prisma/client'

/** Safe on any public page — no email, role, Stripe id or geo. */
export const userPublicSelect = {
  id: true,
  firstName: true,
  lastName: true,
  anonymousBidding: true
} satisfies Prisma.UserSelect

/** Adds email. Admin views and the user's own pages only. */
export const userContactSelect = {
  ...userPublicSelect,
  email: true
} satisfies Prisma.UserSelect

export const bidSelect = {
  id: true,
  bidAmount: true,
  auctionId: true,
  auctionItemId: true,
  userId: true,
  bidderId: true,
  status: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.AuctionBidSelect

/** Auction header fields safe on any public page. */
export const auctionPublicSelect = {
  id: true,
  title: true,
  status: true,
  startDate: true,
  endDate: true,
  customAuctionLink: true
} satisfies Prisma.AuctionSelect

/** Item card fields safe on any public page. */
export const auctionItemPublicSelect = {
  id: true,
  name: true,
  sellingFormat: true,
  status: true,
  startingPrice: true,
  buyNowPrice: true,
  currentBid: true,
  photos: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
  _count: { select: { bids: true } }
} satisfies Prisma.AuctionItemSelect

/** Photos in display order — primary first. */
export const photosOrdered = {
  orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }]
} satisfies Prisma.AuctionItemPhotoFindManyArgs
