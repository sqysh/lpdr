import { OrderType } from '@prisma/client'

export const ORDER_TYPE_CONFIG: Record<string, { label: string; message: string }> = {
  ONE_TIME_DONATION: {
    label: 'Donation Confirmed',
    message: 'Your generosity helps rescued dachshunds find their forever homes. Every dollar makes a real difference.'
  },
  RECURRING_DONATION: {
    label: 'Recurring Donation Active',
    message: 'Your ongoing support means our dogs get consistent care all year long. Thank you for being a monthly hero.'
  },
  PURCHASE: {
    label: 'Order Confirmed',
    message: 'Your order is confirmed. Every purchase supports the dogs in our rescue program.'
  },
  ADOPTION_FEE: {
    label: 'Application Fee Received',
    message:
      "We've received your adoption application fee. Our team will be in touch within 3–5 business days — your perfect dachshund match is out there!"
  },
  AUCTION_PURCHASE: {
    label: 'Payment Confirmed',
    message:
      "Your auction payment has been received. Thank you for supporting Little Paws — we'll be in touch with details about your item shortly."
  },
  ADOPTION_AGREEMENT: {
    label: 'Adoption',
    message: 'Your payment is in and your adoption agreement is signed. Little Paws will countersign it shortly and email you a copy.'
  }
}

export const FILTERS = ['ALL', 'ONE_TIME_DONATION', 'RECURRING_DONATION', 'ADOPTION_FEE', 'AUCTION_PURCHASE', 'PURCHASE'] as const

export type Filter = (typeof FILTERS)[number]

export const FILTER_LABELS: Record<Filter, string> = {
  ALL: 'All',
  ONE_TIME_DONATION: 'One-time',
  RECURRING_DONATION: 'Recurring',
  ADOPTION_FEE: 'Adoption fee',
  PURCHASE: 'Purchase',
  AUCTION_PURCHASE: 'Auction'
}

// Order STATUS badge styles (CONFIRMED / FAILED / etc.) — separate from the type filter
export const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5',
  PENDING: 'border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/5',
  FAILED: 'border-red-500/40 text-red-600 dark:text-red-400 bg-red-500/5'
}

export const DECLINE_EXPLANATIONS: Record<string, string> = {
  card_declined: 'The bank turned down the card. The donor would need to try a different one.',
  insufficient_funds: 'Not enough money in the account.',
  expired_card: 'The card has expired.',
  incorrect_cvc: 'The security code on the back of the card was wrong.',
  incorrect_number: 'The card number was typed wrong.',
  processing_error: "A temporary problem on the bank's end. Trying again usually works.",
  card_velocity_exceeded: 'The card was used too many times in a row and the bank paused it.',
  fraudulent: 'The bank flagged this as suspicious and stopped it.',
  lost_card: 'The card was reported lost.',
  stolen_card: 'The card was reported stolen.',
  authentication_required: 'The bank wanted extra verification that was never completed.'
}

// One place so Transactions, Donations and the dashboard can't drift on what counts as a donation
export const DONATION_TYPES = [OrderType.ONE_TIME_DONATION, OrderType.RECURRING_DONATION] as const

export const DONATION_FILTERS = ['ALL', 'ONE_TIME_DONATION', 'RECURRING_DONATION'] as const
export type DonationFilter = (typeof DONATION_FILTERS)[number]

export const DONATION_FILTER_LABELS: Record<DonationFilter, string> = {
  ALL: 'All',
  ONE_TIME_DONATION: 'One-time',
  RECURRING_DONATION: 'Recurring'
}

export const isDonation = (type: OrderType) => (DONATION_TYPES as readonly OrderType[]).includes(type)

// Where a given order lives in the admin nav, so breadcrumbs and back links agree
export function getOrderSection(order: { type: OrderType; isRecurring?: boolean | null }) {
  if (order.isRecurring) return { href: '/admin/subscriptions', label: 'Subscriptions' }
  if (isDonation(order.type)) return { href: '/admin/donations', label: 'Donations' }
  return { href: '/admin/transactions', label: 'Transactions' }
}

export const SUBSCRIPTION_FILTERS = ['ALL', 'ACTIVE', 'ENDED'] as const
export type SubscriptionFilter = (typeof SUBSCRIPTION_FILTERS)[number]

export const SUBSCRIPTION_FILTER_LABELS: Record<SubscriptionFilter, string> = {
  ALL: 'All',
  ACTIVE: 'Active',
  ENDED: 'Ended'
}
