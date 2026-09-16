/** What the admin picks, and the one line that changes in the email because of it. */
export const REFUND_REASONS = {
  DUPLICATE: {
    label: 'They were charged twice',
    line: 'You were charged twice for the same thing, so we have refunded one of the payments. Your original payment still stands and nothing else has changed.'
  },
  REQUESTED: {
    label: 'They asked for a refund',
    line: 'We have refunded your payment, as you asked.'
  },
  PROBLEM: {
    label: 'Something went wrong',
    line: 'Something went wrong with this payment on our end, so we have refunded it. If you meant to go ahead, you are very welcome to try again.'
  }
} as const

export type RefundReason = keyof typeof REFUND_REASONS
