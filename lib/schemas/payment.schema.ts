import { z } from 'zod'
import { OrderType } from '@prisma/client'
import { MAX_DONATION_CENTS } from 'lib/constants/donation.constants'

export const paymentItemSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive().max(99),
  shippingPrice: z.number().nonnegative().optional(),
  isPhysicalProduct: z.boolean(),
  size: z.string().nullable().optional(),
  welcomeWienerId: z.string().nullable().optional(),
  welcomeWienerProductId: z.string().nullable().optional(),
  feedAFosterId: z.string().nullable().optional()
})

export const createPaymentIntentSchema = z.object({
  amount: z.number().int().nonnegative().max(MAX_DONATION_CENTS).optional(),
  orderType: z.enum(OrderType),
  saveCard: z.boolean().default(false),
  coverFees: z.boolean().default(false),
  savedCardId: z.string().nullable().optional(),
  items: z.array(paymentItemSchema).max(50).optional(),
  winningBidderId: z.string().optional(),
  auctionItemId: z.string().optional(),
  donorMessage: z.string().trim().max(500).optional()
})

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>
