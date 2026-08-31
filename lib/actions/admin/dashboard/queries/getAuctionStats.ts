import prisma from 'prisma/client'

export async function getAuctionStats() {
  const [activeAuctions, totalAuctionRevenue] = await Promise.all([
    prisma.auction.count({ where: { status: 'ACTIVE' } }),
    prisma.auctionWinningBidder.aggregate({
      where: { winningBidPaymentStatus: 'PAID' },
      _sum: { totalPrice: true }
    })
  ])

  return {
    activeAuctions,
    auctionRevenue: Number(totalAuctionRevenue._sum?.totalPrice ?? 0)
  }
}
