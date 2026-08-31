import prisma from 'prisma/client'

export async function getTotalRevenue() {
  const result = await prisma.order.aggregate({
    where: { status: 'CONFIRMED', source: 'SITE' },
    _sum: { totalAmount: true }
  })
  return Number(result._sum.totalAmount ?? 0)
}
