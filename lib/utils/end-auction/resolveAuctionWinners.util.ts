import { Prisma } from '@prisma/client'
import prisma from 'prisma/client'

const ZERO = new Prisma.Decimal(0)

const shippingFor = (item: { requiresShipping: boolean; shippingCosts: Prisma.Decimal | null }) =>
  item.requiresShipping ? (item.shippingCosts ?? ZERO) : ZERO

export async function resolveAuctionWinners(auctionId: string) {
  // Resolving twice would create a second winner row per user, which means a second payment
  // request email and a second charge. A cron retry or an admin ending an auction the cron
  // already ended both land here, so the second run is a no-op. Resending a payment request
  // is a deliberate admin action, not something a retry should trigger.
  const alreadyResolved = await prisma.auctionWinningBidder.findFirst({ where: { auctionId }, select: { id: true } })
  if (alreadyResolved) return []

  const topBids = await prisma.auctionBid.findMany({
    where: { auctionId, status: 'TOP_BID' },
    include: {
      auctionItem: true,
      user: { select: { id: true, firstName: true, lastName: true, email: true } }
    }
  })

  // Two TOP_BID rows on one item means two people get billed for the same thing. That can happen
  // if a bid lands as the auction closes and the status flip races. Fail the cron instead.
  const distinctItems = new Set(topBids.map((b) => b.auctionItemId))
  if (distinctItems.size !== topBids.length) {
    throw new Error(`Auction ${auctionId} has more than one TOP_BID on an item. Resolve by hand before ending.`)
  }

  const byUser = topBids.reduce<Record<string, typeof topBids>>((acc, bid) => {
    if (!acc[bid.userId]) acc[bid.userId] = []
    acc[bid.userId].push(bid)
    return acc
  }, {})

  const winnerIds = Object.keys(byUser)

  // Decimal the whole way to the column. Summing through Number produces values like
  // 70.34000000000001, and it surfaces on a receipt.
  const totals = Object.fromEntries(
    Object.entries(byUser).map(([userId, bids]) => {
      const itemsTotal = bids.reduce((sum, b) => sum.plus(b.bidAmount), ZERO)
      const shipping = bids.reduce((sum, b) => sum.plus(shippingFor(b.auctionItem)), ZERO)
      return [userId, { itemsTotal, shipping, totalPrice: itemsTotal.plus(shipping) }]
    })
  )

  const winnerRowIds = await prisma.$transaction(
    async (tx) => {
      // createManyAndReturn instead of a create per winner: one round trip rather than N.
      const created = winnerIds.length
        ? await tx.auctionWinningBidder.createManyAndReturn({
            data: winnerIds.map((userId) => ({
              auctionId,
              userId,
              itemsTotal: totals[userId].itemsTotal,
              shipping: totals[userId].shipping,
              totalPrice: totals[userId].totalPrice,
              winningBidPaymentStatus: 'AWAITING_PAYMENT' as const,
              auctionItemPaymentStatus: 'PENDING' as const,
              shippingStatus: 'PENDING_PAYMENT_CONFIRMATION' as const
            })),
            select: { id: true, userId: true }
          })
        : []

      const idByUser = Object.fromEntries(created.map((row) => [row.userId, row.id]))

      // Each item carries its own soldPrice, so this is the one loop that can't collapse.
      for (const bid of topBids) {
        await tx.auctionItem.update({
          where: { id: bid.auctionItemId },
          data: {
            status: 'SOLD',
            soldPrice: bid.bidAmount,
            auctionWinningBidderId: idByUser[bid.userId]
          }
        })
      }

      if (winnerIds.length) {
        await tx.auctionBidder.updateMany({ where: { auctionId, userId: { in: winnerIds } }, data: { status: 'WINNER' } })
      }

      await tx.auctionBidder.updateMany({ where: { auctionId, userId: { notIn: winnerIds } }, data: { status: 'LOST' } })

      // Items default to UNSOLD, so on a
      // clean run this matches nothing; it earns its place after a revert-to-draft, resetting
      // anything a previous resolution marked SOLD.
      await tx.auctionItem.updateMany({
        where: { auctionId, status: { not: 'SOLD' } },
        data: { status: 'UNSOLD' }
      })

      return idByUser
    },
    // One round trip per won item against Neon adds up. The 5s default rolls the whole
    // resolution back on a busy auction and the failure shows up as winner emails not arriving.
    { timeout: 30_000, maxWait: 10_000 }
  )

  // Numbers at the boundary: the email templates and payment request flow want plain values.
  return winnerIds.map((userId) => {
    const bids = byUser[userId]
    const { itemsTotal, shipping, totalPrice } = totals[userId]

    return {
      userId,
      winningBidderId: winnerRowIds[userId],
      user: bids[0].user,
      items: bids.map((b) => ({
        id: b.auctionItemId,
        name: b.auctionItem.name,
        soldPrice: Number(b.bidAmount),
        requiresShipping: b.auctionItem.requiresShipping,
        shipping: shippingFor(b.auctionItem).toNumber()
      })),
      itemsTotal: itemsTotal.toNumber(),
      shipping: shipping.toNumber(),
      totalPrice: totalPrice.toNumber()
    }
  })
}
