import { z } from 'zod'
import { AuctionStatus, SellingFormat } from '@prisma/client'
import { validateAuctionHour } from 'lib/utils/auction.utils'

const titleField = z.string().trim().min(1, 'Title is required')

// ─── Auction ──────────────────────────────────────────────────────────────

/**
 * What createAuction accepts — dates already parsed.
 */
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

/**
 * What AdminAuctionModal collects — dates as ISO strings from the paired date/time inputs.
 */
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

/**
 * What updateAuction accepts — every field optional, dates already parsed.
 */
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

const nameField_ = z.string().trim().min(1, 'Name is required')

/**
 * Spread into the schemas below so the server rules and the live-edit subset
 * can't drift, same pattern as the payment field groups further down.
 */
const auctionItemFields = {
  auctionId: z.string().min(1),
  name: nameField_,
  description: z.string().trim().optional(),
  sellingFormat: z.enum(SellingFormat),
  startingPrice: z.coerce.number().positive().nullable().optional(),
  buyNowPrice: z.coerce.number().positive().nullable().optional(),
  totalQuantity: z.coerce.number().int().positive().max(999).default(1),
  requiresShipping: z.boolean().default(true),
  shippingCosts: z.coerce.number().nonnegative().nullable().optional(),
  photos: z.array(z.url()).max(20).default([])
}

export const createAuctionItemSchema = z
  .object(auctionItemFields)
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

/**
 * What updateAuctionItem accepts once bidding is open. Bidders committed to the terms that
 * were on screen when they bid, so price, quantity, shipping and selling format are not
 * editable and are dropped rather than rejected field by field.
 */
export const updateActiveAuctionItemSchema = z.object({
  name: auctionItemFields.name,
  description: auctionItemFields.description,
  photos: auctionItemFields.photos
})

export type UpdateActiveAuctionItemInput = z.infer<typeof updateActiveAuctionItemSchema>

/**
 * What AuctionItemForm collects — number inputs hand back strings.
 */
const moneyString = (label: string, { allowZero = false } = {}) =>
  z
    .string()
    .trim()
    .refine((v) => v === '' || (/^\d+(\.\d{1,2})?$/.test(v) && (allowZero ? Number(v) >= 0 : Number(v) > 0)), {
      message: `${label} must be a dollar amount like 25 or 25.50`
    })

export const createAuctionItemFormSchema = z
  .object({
    name: nameField_,
    description: z.string().trim().max(2000, 'Keep the description under 2000 characters'),
    sellingFormat: z.enum(SellingFormat),
    startingPrice: moneyString('Starting price'),
    buyNowPrice: moneyString('Buy now price'),
    totalQuantity: z
      .string()
      .trim()
      .refine((v) => v === '' || (/^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 999), {
        message: 'Quantity must be a whole number from 1 to 999'
      }),
    requiresShipping: z.boolean(),
    shippingCosts: moneyString('Shipping cost', { allowZero: true })
  })
  .refine((d) => d.sellingFormat !== 'AUCTION' || d.startingPrice !== '', {
    message: 'Starting price is required',
    path: ['startingPrice']
  })
  .refine((d) => d.sellingFormat !== 'FIXED' || d.buyNowPrice !== '', {
    message: 'Buy now price is required',
    path: ['buyNowPrice']
  })

export type CreateAuctionItemFormValues = z.infer<typeof createAuctionItemFormSchema>

const toMoney = (value: string) => (value.trim() === '' ? null : Number(value))

export function toAuctionItemPayload(
  values: CreateAuctionItemFormValues,
  { auctionId, photos }: { auctionId: string; photos: string[] }
): CreateAuctionItemInput {
  return {
    auctionId,
    name: values.name,
    description: values.description || undefined,
    sellingFormat: values.sellingFormat,
    startingPrice: toMoney(values.startingPrice),
    buyNowPrice: toMoney(values.buyNowPrice),
    totalQuantity: values.totalQuantity.trim() === '' ? 1 : Number(values.totalQuantity),
    requiresShipping: values.requiresShipping,
    shippingCosts: toMoney(values.shippingCosts),
    photos
  }
}

// ─── Auction payment forms ────────────────────────────────────────────────
/**
 * Shared by instant buy and the winner payment page: both collect who to
 * bill, plus a shipping address when the item ships.
 */

const nameField = (label: string) => z.string().trim().min(1, `${label} is required`).max(60)

/** Step 2. Email comes from the session. */
export const auctionPaymentNameFields = {
  firstName: nameField('First name'),
  lastName: nameField('Last name')
}

/**
 * Step 3, only reached when the item ships. Defaults to empty rather than
 * required, since the schema cannot see whether shipping applies.
 */
export const auctionPaymentAddressFields = {
  addressLine1: z.string().trim().max(120).default(''),
  addressLine2: z.string().trim().max(120).default(''),
  city: z.string().trim().max(60).default(''),
  state: z.string().trim().max(2).default(''),
  zipPostalCode: z.string().trim().max(10).default('')
}

export const auctionPaymentSchema = z.object({
  ...auctionPaymentNameFields,
  ...auctionPaymentAddressFields
})

export type AuctionPaymentInput = z.input<typeof auctionPaymentSchema>
export type AuctionPaymentValues = z.output<typeof auctionPaymentSchema>
