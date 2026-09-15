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
  updatedAt: true,
  user: { select: { anonymousBidding: true, firstName: true, lastName: true } }
} satisfies Prisma.AuctionBidSelect
