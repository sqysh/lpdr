import Stripe from 'stripe'
import prisma from 'prisma/client'
import { stripeClient } from 'lib/stripe/stripe-client'
import { createLog } from 'lib/actions/log/createLog'

// charge.updated can arrive before payment_intent.succeeded has created the order. During this window a
// missing order means "not yet", so Stripe is asked to retry. After it, the charge has no order and never will
const ORDER_WAIT_MS = 10 * 60 * 1000

/** Records the fee Stripe actually took on a payment, once Stripe has settled it onto the charge */
export async function handleChargeUpdated(charge: Stripe.Charge) {
  const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id
  const balanceTransactionId = typeof charge.balance_transaction === 'string' ? charge.balance_transaction : charge.balance_transaction?.id

  // charge.updated also fires for description/metadata edits; only act once the fee exists
  if (!paymentIntentId || !balanceTransactionId) return

  const order = await prisma.order.findFirst({
    where: { paymentIntentId },
    select: { id: true, stripeFee: true }
  })

  if (!order) {
    if (Date.now() - charge.created * 1000 < ORDER_WAIT_MS) throw new Error(`No order yet for ${paymentIntentId}`)
    return
  }

  if (order.stripeFee != null) return

  const balance = await stripeClient.balanceTransactions.retrieve(balanceTransactionId)
  const stripeFee = balance.fee / 100

  await prisma.order.update({ where: { id: order.id }, data: { stripeFee } })
  await createLog('info', 'Stripe fee recorded', { orderId: order.id, paymentIntentId, stripeFee })
}
