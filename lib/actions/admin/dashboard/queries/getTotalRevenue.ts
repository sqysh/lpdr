import prisma from 'prisma/client'

export async function getTotalRevenue() {
  const result = await prisma.order.aggregate({
    where: { status: 'CONFIRMED', source: 'SITE' },
    // Partial refunds leave an order confirmed, so what went back is taken off what was charged
    _sum: { totalAmount: true, refundedAmount: true }
  })

  return Number(result._sum.totalAmount ?? 0) - Number(result._sum.refundedAmount ?? 0)
}
