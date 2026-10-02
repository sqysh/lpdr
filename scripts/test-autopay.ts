import prisma from 'prisma/client'
import { stripeClient } from 'lib/stripe/stripe-client'
import { processAutoPay } from 'lib/utils/end-auction/processAutoPay.util'

type Winner = Parameters<typeof processAutoPay>[0]

const winningBidderId = process.argv[2]
const reportOnly = process.argv.includes('--report-only')

/** The winner's payment status, every Stripe payment made for this win, and the orders recorded against them */
async function report(label: string, userId: string, customerId: string | null) {
  const row = await prisma.auctionWinningBidder.findUniqueOrThrow({
    where: { id: winningBidderId },
    select: { winningBidPaymentStatus: true, paidOn: true }
  })

  const intents = customerId
    ? (await stripeClient.paymentIntents.list({ customer: customerId, limit: 20 })).data.filter(
        (pi) => pi.metadata?.winningBidderId === winningBidderId
      )
    : []

  const orders = intents.length
    ? await prisma.order.findMany({
        where: { paymentIntentId: { in: intents.map((pi) => pi.id) } },
        select: { id: true, paymentIntentId: true, totalAmount: true, stripeFee: true, autoPaid: true }
      })
    : []

  console.log(`\n── ${label} ──`)
  console.log(`Winner:   ${row.winningBidPaymentStatus}${row.paidOn ? ` (paid ${row.paidOn.toISOString()})` : ''}`)
  console.log(
    `Payments: ${intents.length ? intents.map((pi) => `${pi.id} ${pi.status} $${(pi.amount / 100).toFixed(2)}`).join(', ') : 'none'}`
  )
  console.log(
    `Orders:   ${orders.length ? orders.map((o) => `${o.id} $${Number(o.totalAmount).toFixed(2)} fee ${o.stripeFee ?? 'pending'}`).join(', ') : 'none'}`
  )

  return {
    paid: row.winningBidPaymentStatus === 'PAID',
    charged: intents.some((pi) => pi.status === 'succeeded'),
    orders: orders.length,
    userId
  }
}

async function main() {
  if (!winningBidderId) {
    console.log('Usage: npx tsx --conditions=react-server scripts/test-autopay.ts <winningBidderId> [--report-only]')
    return
  }

  // Never against live Stripe: this charges the winner's saved card
  const { livemode } = await stripeClient.balance.retrieve()
  if (livemode) throw new Error('Refusing to run: the Stripe key is a live key. Use your test keys.')

  const row = await prisma.auctionWinningBidder.findUniqueOrThrow({
    where: { id: winningBidderId },
    select: {
      id: true,
      userId: true,
      itemsTotal: true,
      shipping: true,
      totalPrice: true,
      auction: { select: { id: true, title: true } },
      user: { select: { id: true, firstName: true, lastName: true, email: true, stripeCustomerId: true } }
    }
  })

  const items = await prisma.auctionItem.findMany({
    where: { auctionWinningBidderId: row.id },
    select: { id: true, name: true, soldPrice: true, requiresShipping: true, shippingCosts: true }
  })

  // The same shape resolveAuctionWinners hands the cron
  const winner: Winner = {
    userId: row.userId,
    winningBidderId: row.id,
    user: { id: row.user.id, firstName: row.user.firstName, lastName: row.user.lastName, email: row.user.email },
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      soldPrice: Number(item.soldPrice ?? 0),
      requiresShipping: item.requiresShipping,
      shipping: item.requiresShipping ? Number(item.shippingCosts ?? 0) : 0
    })),
    itemsTotal: Number(row.itemsTotal),
    shipping: Number(row.shipping),
    totalPrice: Number(row.totalPrice)
  }

  const before = await report('Before', row.userId, row.user.stripeCustomerId)
  if (reportOnly) return

  let paymentRequests = 0
  await processAutoPay(winner, row.auction, async () => {
    paymentRequests++
    console.log('\n→ Would email a payment request')
  })

  // Give the webhook a moment, since it may record the fee or the order in the background
  await new Promise((resolve) => setTimeout(resolve, 3000))
  const after = await report('After', row.userId, row.user.stripeCustomerId)

  console.log(`\nPayment requests: ${paymentRequests}`)

  if (after.charged) {
    const ok = after.paid && after.orders === 1 && paymentRequests === 0
    console.log(
      ok ? '✓ PASS: charged once, one order, no payment request' : '✗ FAIL: charged, but the order count or payment request is wrong'
    )
  } else {
    const ok = !after.paid && after.orders === 0 && paymentRequests === 1
    console.log(ok ? '✓ PASS: not charged, payment request sent instead' : '✗ FAIL: not charged, but the state is wrong')
  }

  if (before.charged && paymentRequests > 0) console.log('✗ This winner was already charged and would have been asked to pay again')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
