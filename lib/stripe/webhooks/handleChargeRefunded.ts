import Stripe from 'stripe'
import prisma from 'prisma/client'
import { createLog } from 'lib/actions/log/createLog'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'

/**
 * The one place refunds are recorded on an order, whether they came from the refund button in the
 * admin or were made directly in the Stripe dashboard. The button only sends the refund to Stripe;
 * this writes it once Stripe confirms, so the two routes can never record the same refund twice.
 */
export async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : (charge.payment_intent?.id ?? null)
  if (!paymentIntentId) return

  try {
    const order = await prisma.order.findUnique({
      where: { paymentIntentId },
      select: { id: true, type: true, customerEmail: true, adoptionAgreement: { select: { dogName: true } } }
    })

    if (!order) {
      await createLog('warn', 'Refund received for a payment with no order', { paymentIntentId, amount: charge.amount_refunded / 100 })
      return
    }

    // Stripe reports the total refunded across every refund on the charge, not just this one, so the
    // value is set rather than added. A repeated event, or a second partial refund, lands on the right total
    const refundedAmount = charge.amount_refunded / 100
    const fullyRefunded = charge.refunded

    await prisma.order.update({
      where: { id: order.id },
      data: {
        refundedAmount,
        refundedAt: new Date(),
        // Partial refunds keep the order confirmed; only returning the whole charge makes it REFUNDED
        ...(fullyRefunded && { status: 'REFUNDED' })
      }
    })

    const payload = {
      orderId: order.id,
      type: order.type,
      email: order.customerEmail,
      refundedAmount,
      fullyRefunded,
      dogName: order.adoptionAgreement?.dogName ?? null
    }

    await Promise.all([
      createLog('info', fullyRefunded ? 'Order fully refunded' : 'Order partially refunded', payload),
      pusherSuperuser('order-refunded', payload).catch(() => {})
    ])
  } catch (error) {
    await createLog('error', 'Failed to record refund', {
      paymentIntentId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    // Rethrown so Stripe retries. Setting the running total makes a retry safe
    throw error
  }
}
