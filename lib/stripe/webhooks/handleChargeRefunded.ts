import Stripe from 'stripe'
import prisma from 'prisma/client'
import { createLog } from 'lib/actions/log/createLog'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'

/**
 * Brings an order in line with what Stripe says was refunded on its charge. Returns true when it
 * changed anything. Safe to run any number of times, since it sets Stripe's running total.
 */
export async function applyChargeRefund(charge: Stripe.Charge): Promise<boolean> {
  const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : (charge.payment_intent?.id ?? null)
  if (!paymentIntentId || charge.amount_refunded === 0) return false

  const order = await prisma.order.findUnique({
    where: { paymentIntentId },
    select: {
      id: true,
      type: true,
      customerEmail: true,
      refundedAmount: true,
      refundedAt: true,
      status: true,
      adoptionAgreement: { select: { dogName: true } }
    }
  })

  if (!order) {
    await createLog('warn', 'Refund received for a payment with no order', { paymentIntentId, amount: charge.amount_refunded / 100 })
    return false
  }

  const refundedAmount = charge.amount_refunded / 100
  const fullyRefunded = charge.refunded

  // The latest refund's own date, so a refund recorded late still shows when it actually happened
  const latest = charge.refunds?.data?.[0]?.created
  const refundedAt = latest ? new Date(latest * 1000) : new Date()

  // Already matches Stripe, date included, so a repeat run doesn't rewrite it or announce it again
  const matches =
    Number(order.refundedAmount ?? 0) === refundedAmount &&
    (!fullyRefunded || order.status === 'REFUNDED') &&
    (!latest || order.refundedAt?.getTime() === refundedAt.getTime())

  if (matches) return false

  await prisma.order.update({
    where: { id: order.id },
    data: { refundedAmount, refundedAt, ...(fullyRefunded && { status: 'REFUNDED' }) }
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

  return true
}

/** The charge.refunded webhook, whether the refund came from the admin's refund button or the Stripe dashboard. */
export async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    await applyChargeRefund(charge)
  } catch (error) {
    await createLog('error', 'Failed to record refund', {
      chargeId: charge.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    // Rethrown so Stripe retries. Setting the running total makes a retry safe
    throw error
  }
}
