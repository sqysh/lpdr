import 'dotenv/config'
import Stripe from 'stripe'
import prisma from 'prisma/client'
import { stripeClient } from 'lib/stripe/stripe-client'

/**
 * Fills stripeFee on orders paid before the charge.updated handler existed, from each payment's balance
 * transaction. Safe to run more than once: orders that already have a fee are skipped
 */
async function main() {
  const orders = await prisma.order.findMany({
    where: { stripeFee: null, paymentIntentId: { not: null }, status: { in: ['CONFIRMED', 'REFUNDED'] } },
    select: { id: true, paymentIntentId: true }
  })

  console.log(`${orders.length} orders to check`)
  let updated = 0

  for (const order of orders) {
    try {
      const intent = await stripeClient.paymentIntents.retrieve(order.paymentIntentId!, {
        expand: ['latest_charge.balance_transaction']
      })
      const charge = intent.latest_charge as Stripe.Charge | null
      const balance = charge?.balance_transaction as Stripe.BalanceTransaction | null
      if (!balance) continue

      await prisma.order.update({ where: { id: order.id }, data: { stripeFee: balance.fee / 100 } })
      updated++
    } catch (error) {
      console.error(`Skipped ${order.id}:`, error instanceof Error ? error.message : error)
    }
  }

  console.log(`Recorded the fee on ${updated} orders`)
}

main().finally(() => prisma.$disconnect())
