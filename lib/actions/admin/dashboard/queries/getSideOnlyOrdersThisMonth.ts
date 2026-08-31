import prisma from 'prisma/client'
import { monthRange } from 'app/utils/_date.utils'

export async function getSiteOnlyOrdersThisMonth() {
  const now = new Date()
  const thisMonth = monthRange(now.getFullYear(), now.getMonth())

  return prisma.order.findMany({
    where: { status: 'CONFIRMED', source: 'SITE', createdAt: { gte: thisMonth.start } },
    select: { totalAmount: true }
  })
}
