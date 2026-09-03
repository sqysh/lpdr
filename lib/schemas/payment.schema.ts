import { z } from 'zod'
import { OrderType } from '@prisma/client'

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
  amount: z.number().int().nonnegative().max(2_000_000).optional(),
  orderType: z.enum(OrderType),
  saveCard: z.boolean().default(false),
  coverFees: z.boolean().default(false),
  savedCardId: z.string().nullable().optional(),
  items: z.array(paymentItemSchema).max(50).optional(),
  winningBidderId: z.string().optional(),
  auctionItemId: z.string().optional()
})

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>
