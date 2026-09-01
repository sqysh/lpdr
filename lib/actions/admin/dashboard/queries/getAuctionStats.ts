import prisma from 'prisma/client'

export async function getAuctionStats() {
  const [activeAuctions, totalAuctionRevenue] = await Promise.all([
    prisma.auction.count({ where: { status: 'ACTIVE' } }),
    prisma.auction.aggregate({
      _sum: { totalAuctionRevenue: true }
    })
  ])

  return {
    activeAuctions,
    auctionRevenue: Number(totalAuctionRevenue._sum?.totalAuctionRevenue ?? 0)
  }
}
