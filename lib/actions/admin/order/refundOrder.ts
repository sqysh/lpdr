'use server'

import prisma from 'prisma/client'
import { requireAccess } from 'lib/auth/guards'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { parseInput } from 'lib/utils/validate.utils'
import { stripeClient } from 'lib/stripe/stripe-client'
import { refundOrderSchema } from 'lib/schemas/order.schema'
import type { ActionResult } from 'types/action.types'
import Stripe from 'stripe'

/**
 * Sends the refund to Stripe. Recording it on the order is left to the charge.refunded webhook, the same
 * path a refund made in the Stripe dashboard takes, so there's one place refunds get written.
 */
export async function refundOrder(input: unknown): Promise<ActionResult<null>> {
  const gate = await requireAccess('MONEY')
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  const parsed = parseInput(refundOrderSchema, input)
  if (parsed.ok === false) return parsed.result

  const { orderId, amount, reason } = parsed.data

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { paymentIntentId: true, totalAmount: true, refundedAmount: true, status: true }
    })

    if (!order) return { success: false, data: null, error: 'Order not found' }
    if (!order.paymentIntentId)
      return {
        success: false,
        data: null,
        error: 'This payment was made outside Stripe, so it has to be refunded the same way it was paid.'
      }
    if (order.status === 'REFUNDED') return { success: false, data: null, error: 'This order has already been fully refunded.' }

    const previouslyRefundedCents = Math.round(Number(order.refundedAmount ?? 0) * 100) // earlier refunds
    const remainingCents = Math.round(Number(order.totalAmount) * 100) - previouslyRefundedCents // what's left
    const amountCents = Math.round(Number(amount) * 100) // what the admin typed now

    if (amountCents > remainingCents) {
      return { success: false, data: null, error: `Only $${(remainingCents / 100).toFixed(2)} is left to refund on this order.` }
    }

    // Keyed on what's been refunded so far: a double click sends one refund, while a genuine
    // second partial refund later gets a new key because the running total has moved
    await stripeClient.refunds.create(
      { payment_intent: order.paymentIntentId, amount: amountCents, reason, metadata: { orderId, refundedBy: gate.userId } },
      // Keyed on what's been refunded so far plus the reason: a double click sends one refund, a genuine second
      // partial refund gets a new key because the running total has moved, and changing the reason isn't refused.
      // refundedBy stays out on purpose, so two admins refunding the same amount at once collide instead of
      // refunding twice
      { idempotencyKey: `refund-${orderId}-${previouslyRefundedCents}-${amountCents}-${reason ?? 'none'}` }
    )

    await createLog('info', 'Refund sent to Stripe', { orderId, amount: amountCents / 100, reason, refundedBy: gate.userId })

    return { success: true, data: null }
  } catch (error) {
    await createLog('error', 'Failed to send refund', { orderId, error: getErrorMessage(error) })

    const code = error instanceof Stripe.errors.StripeError ? error.code : undefined
    const message =
      code === 'charge_already_refunded'
        ? 'This payment has already been fully refunded in Stripe. Refresh the page to see it.'
        : code === 'idempotency_error'
          ? 'A refund for this order was just sent, possibly by someone else. Refresh the page before trying again.'
          : code === 'amount_too_large'
            ? 'That amount is more than what is left to refund on this payment in Stripe.'
            : "The refund didn't go through. Check the payment in Stripe before trying again, so it isn't refunded twice."

    return { success: false, data: null, error: message }
  }
}
