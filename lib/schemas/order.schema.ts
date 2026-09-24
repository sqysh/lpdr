import { z } from 'zod'
import { MONEY_PATTERN } from 'lib/constants/regex.constants'

/** Amount in dollars, so a partial refund (the fee back, the certificate kept) is just a smaller number. */
export const refundOrderSchema = z.object({
  orderId: z.string().min(1),
  amount: z
    .string()
    .trim()
    .refine((v) => MONEY_PATTERN.test(v) && Number(v) > 0, 'Enter an amount like 450 or 450.00'),
  reason: z.enum(['requested_by_customer', 'duplicate', 'fraudulent']).default('requested_by_customer')
})

export type RefundOrderInput = z.input<typeof refundOrderSchema>
export type RefundOrderValues = z.output<typeof refundOrderSchema>
