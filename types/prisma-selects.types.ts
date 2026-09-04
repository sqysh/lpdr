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
