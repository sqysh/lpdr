export const ORDER_TYPE_CONFIG: Record<string, { label: string; message: string }> = {
  ONE_TIME_DONATION: {
    label: 'Donation Confirmed',
    message: 'Your generosity helps rescued dachshunds find their forever homes. Every dollar makes a real difference.'
  },
  RECURRING_DONATION: {
    label: 'Recurring Donation Active',
    message:
      'Your ongoing support means our dogs get consistent care all year long. Thank you for being a monthly hero.'
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
  }
}

export const FILTERS = [
  'ALL',
  'ONE_TIME_DONATION',
  'RECURRING_DONATION',
  'ADOPTION_FEE',
  'AUCTION_PURCHASE',
  'PURCHASE'
] as const

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
