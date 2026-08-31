import prisma from 'prisma/client'
import { monthRange } from 'app/utils/_date.utils'
import { sumAmount } from 'app/utils/_math.utils'

export async function getRevenueTotals() {
  const now = new Date()
  const thisMonth = monthRange(now.getFullYear(), now.getMonth())
  const lastMonth = monthRange(now.getFullYear(), now.getMonth() - 1)

  const [allOrders, thisMonthOrders, lastMonthOrders] = await Promise.all([
    prisma.order.findMany({
      where: { status: 'CONFIRMED', source: 'SITE' },
      select: { totalAmount: true, createdAt: true }
    }),
    prisma.order.findMany({
      where: { status: 'CONFIRMED', source: 'SITE', createdAt: { gte: thisMonth.start } },
      select: { totalAmount: true }
    }),
    prisma.order.findMany({
      where: {
        status: 'CONFIRMED',
        source: 'SITE',
        createdAt: { gte: lastMonth.start, lte: lastMonth.end }
      },
      select: { totalAmount: true }
    })
  ])

  const totalRevenue = sumAmount(allOrders)
  const thisMonthRevenue = sumAmount(thisMonthOrders)
  const lastMonthRevenue = sumAmount(lastMonthOrders)
  const monthlyChange =
    lastMonthRevenue === 0 ? null : ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100

  return {
    totalRevenue,
    thisMonthRevenue,
    lastMonthRevenue,
    monthlyChange,
    liveRevenue: totalRevenue
  }
}
