import { Prisma } from '@prisma/client'
import { FILTERS } from 'lib/constants/order.constants'
import { userContactSelect } from './prisma-selects.types'
import { DecimalToNumber } from './prisma.types'

// ─── Query args ───────────────────────────────────────────────────────────

/** Admin order detail — everything on the order plus its items and buyer. */
export const orderDetailArgs = Prisma.validator<Prisma.OrderDefaultArgs>()({
  include: {
    items: true,
    user: { select: userContactSelect }
  }
})

export type IOrder = DecimalToNumber<Prisma.OrderGetPayload<typeof orderDetailArgs>>
export type IOrderItem = IOrder['items'][number]

/** Admin orders table — no items, just the count. */
export const orderListArgs = Prisma.validator<Prisma.OrderDefaultArgs>()({
  select: {
    id: true,
    type: true,
    status: true,
    shippingStatus: true,
    shipping: true,
    coverFees: true,
    feesCovered: true,
    subtotal: true,
    totalAmount: true,
    customerName: true,
    customerEmail: true,
    isRecurring: true,
    recurringFrequency: true,
    stripeSubscriptionId: true,
    tierName: true,
    userId: true,
    createdAt: true,
    _count: { select: { items: true } },
    items: { select: { quantity: true } }
  }
})

export type IOrderRow = DecimalToNumber<Prisma.OrderGetPayload<typeof orderListArgs>>

/** One payment in a subscription's history. */
export const subscriptionOrderArgs = Prisma.validator<Prisma.OrderDefaultArgs>()({
  select: {
    id: true,
    status: true,
    totalAmount: true,
    createdAt: true,
    paymentIntentId: true,
    failureCode: true,
    failureReason: true,
    nextBillingDate: true,
    isFirstPayment: true
  }
})

export type ISubscriptionOrder = DecimalToNumber<Prisma.OrderGetPayload<typeof subscriptionOrderArgs>>

// ─── Table grouping ───────────────────────────────────────────────────────

export type Filter = (typeof FILTERS)[number]

export type FlatRow = { kind: 'flat'; order: IOrderRow }
export type GroupRow = { kind: 'group'; subscriptionId: string; orders: IOrderRow[] }
export type DisplayRow = FlatRow | GroupRow
