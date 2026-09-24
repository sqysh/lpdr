import prisma from 'prisma/client'

export async function getAuctionStats() {
  const [activeAuctions, revenue] = await Promise.all([
    prisma.auction.count({ where: { status: 'ACTIVE' } }),
    prisma.order.aggregate({
      where: { type: 'AUCTION_PURCHASE', status: 'CONFIRMED', source: 'SITE' },
      // subtotal rather than totalAmount: the items themselves, without shipping or covered fees,
      // which is what the per-auction counter measures too
      _sum: { subtotal: true, refundedAmount: true }
    })
  ])

  return {
    activeAuctions,
    auctionRevenue: Number(revenue._sum.subtotal ?? 0) - Number(revenue._sum.refundedAmount ?? 0)
  }
}
