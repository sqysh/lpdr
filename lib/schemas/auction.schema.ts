import { z } from 'zod'
import { AuctionStatus, SellingFormat } from '@prisma/client'
import { validateAuctionHour } from 'lib/utils/auction.utils'

// ─── Shared field rules ───────────────────────────────────────────────────
// Defined once so the server schema and the form schema can't drift apart.

const titleField = z.string().trim().min(1, 'Title is required')

// ─── Auction ──────────────────────────────────────────────────────────────

/** What createAuction accepts — dates already parsed. */
export const createAuctionSchema = z
  .object({
    title: titleField,
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    status: z.enum(AuctionStatus).default('DRAFT'),
    goal: z.number().positive().default(1000)
  })
  .refine((d) => d.startDate < d.endDate, {
    message: 'End date must be after start date',
    path: ['endDate']
  })
  .refine((d) => !validateAuctionHour(d.startDate.toISOString()), {
    message: 'Auctions must start on a valid hour',
    path: ['startDate']
  })
  .refine((d) => !validateAuctionHour(d.endDate.toISOString()), {
    message: 'Auctions must end on a valid hour',
    path: ['endDate']
  })

export type CreateAuctionInput = z.infer<typeof createAuctionSchema>

/** What AdminAuctionModal collects — dates as ISO strings from the paired date/time inputs. */
export const createAuctionFormSchema = z
  .object({
    title: titleField,
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required')
  })
  .refine((d) => !validateAuctionHour(d.startDate), {
    message: 'Auctions must start on a valid hour',
    path: ['startDate']
  })
  .refine((d) => !validateAuctionHour(d.endDate), {
    message: 'Auctions must end on a valid hour',
    path: ['endDate']
  })
  .refine((d) => new Date(d.startDate) < new Date(d.endDate), {
    message: 'End date must be after start date',
    path: ['endDate']
  })

export type CreateAuctionFormValues = z.infer<typeof createAuctionFormSchema>

/** What updateAuction accepts — every field optional, dates already parsed. */
export const updateAuctionSchema = z
  .object({
    title: titleField.optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    goal: z.coerce.number().positive().optional(),
    customAuctionLink: z
      .string()
      .trim()
      .min(1)
      .max(80)
      .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers and hyphens only')
      .optional()
  })
  .refine((d) => !d.startDate || !validateAuctionHour(d.startDate.toISOString()), {
    message: 'Auctions must start on a valid hour',
    path: ['startDate']
  })
  .refine((d) => !d.endDate || !validateAuctionHour(d.endDate.toISOString()), {
    message: 'Auctions must end on a valid hour',
    path: ['endDate']
  })
  .refine((d) => !d.startDate || !d.endDate || d.startDate < d.endDate, {
    message: 'End date must be after start date',
    path: ['endDate']
  })

export type UpdateAuctionInput = z.infer<typeof updateAuctionSchema>

// ─── Auction item ─────────────────────────────────────────────────────────

export const createAuctionItemSchema = z
  .object({
    auctionId: z.string().min(1),
    name: z.string().trim().min(1, 'Name is required'),
    description: z.string().trim().optional(),
    sellingFormat: z.enum(SellingFormat),
    startingPrice: z.coerce.number().positive().nullable().optional(),
    buyNowPrice: z.coerce.number().positive().nullable().optional(),
    totalQuantity: z.coerce.number().int().positive().max(999).default(1),
    requiresShipping: z.boolean().default(true),
    shippingCosts: z.coerce.number().nonnegative().nullable().optional(),
    photos: z.array(z.url()).max(20).default([])
  })
  .refine((d) => d.sellingFormat !== 'AUCTION' || d.startingPrice != null, {
    message: 'Starting price is required',
    path: ['startingPrice']
  })
  .refine((d) => d.sellingFormat !== 'FIXED' || d.buyNowPrice != null, {
    message: 'Buy now price is required',
    path: ['buyNowPrice']
  })

export type CreateAuctionItemInput = z.infer<typeof createAuctionItemSchema>

export const updateAuctionItemSchema = createAuctionItemSchema
