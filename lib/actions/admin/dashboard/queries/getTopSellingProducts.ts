import prisma from 'prisma/client'

export async function getTopSellingProducts(limit = 5) {
  const grouped = await prisma.orderItem.groupBy({
    by: ['itemName'],
    where: { itemType: 'PRODUCT', order: { status: 'CONFIRMED', source: 'SITE' } },
    _sum: { totalPrice: true, quantity: true },
    orderBy: { _sum: { totalPrice: 'desc' } },
    take: limit
  })

  const maxRevenue = Math.max(...grouped.map((g) => Number(g._sum.totalPrice ?? 0)), 1)

  return grouped.map((g) => ({
    name: g.itemName ?? 'Unnamed item',
    revenue: Number(g._sum.totalPrice ?? 0),
    unitsSold: g._sum.quantity ?? 0,
    pctOfTop: Math.round((Number(g._sum.totalPrice ?? 0) / maxRevenue) * 100)
  }))
}
