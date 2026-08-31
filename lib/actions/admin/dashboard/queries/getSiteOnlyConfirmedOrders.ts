import prisma from 'prisma/client'

export async function getSiteOnlyConfirmedOrders() {
  return prisma.order.findMany({
    where: { status: 'CONFIRMED', source: 'SITE' },
    select: { totalAmount: true, createdAt: true }
  })
}
