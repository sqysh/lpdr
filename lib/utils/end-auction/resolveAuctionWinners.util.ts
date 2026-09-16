import { Prisma } from '@prisma/client'
import prisma from 'prisma/client'
import { recordAuctionAnomaly } from './recordAuctionAnomaly.util'

const ZERO = new Prisma.Decimal(0)

const shippingFor = (item: { requiresShipping: boolean; shippingCosts: Prisma.Decimal | null }) =>
  item.requiresShipping ? (item.shippingCosts ?? ZERO) : ZERO

export async function resolveAuctionWinners(auctionId: string, auctionTitle: string) {
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

  const distinctItems = new Set(topBids.map((b) => b.auctionItemId))

  if (distinctItems.size !== topBids.length) {
    const counts = topBids.reduce<Record<string, number>>((acc, b) => {
      acc[b.auctionItemId] = (acc[b.auctionItemId] ?? 0) + 1
      return acc
    }, {})

    const offending = Object.entries(counts).filter(([, n]) => n > 1)

    for (const [auctionItemId, count] of offending) {
      const item = topBids.find((b) => b.auctionItemId === auctionItemId)

      await recordAuctionAnomaly({
        auctionId,
        auctionTitle,
        type: 'DUPLICATE_TOP_BID',
        itemId: auctionItemId,
        itemName: item?.auctionItem.name ?? '',
        message: `${count} bids are marked TOP_BID on this item`,
        metadata: { bidIds: topBids.filter((b) => b.auctionItemId === auctionItemId).map((b) => b.id) }
      })
    }

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

      // Everything that did not sell, both formats. status: { not: 'SOLD' } protects an instant
      // buy that already sold, and also resets anything a previous resolution marked SOLD when
      // an auction has been reverted and re-run.
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
