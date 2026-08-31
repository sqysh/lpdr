import prisma from 'prisma/client'
import { monthRange, lastNMonths } from 'app/utils/_date.utils'
import { sumAmount } from 'app/utils/_math.utils'

export async function getOrderMetrics() {
  const now = new Date()
  const thisMonth = monthRange(now.getFullYear(), now.getMonth())
  const lastMonth = monthRange(now.getFullYear(), now.getMonth() - 1)
  const months = lastNMonths(6)
  const windowStart = months[0].start

  // One query, wide enough to cover revenue totals, orders-by-type,
  // the 6-month chart, and the recent orders list.
  const orders = await prisma.order.findMany({
    where: {
      status: 'CONFIRMED',
      source: 'SITE',
      createdAt: { gte: windowStart }
    },
    select: {
      id: true,
      type: true,
      source: true,
      totalAmount: true,
      createdAt: true,
      customerName: true,
      customerEmail: true,
      user: { select: { firstName: true, lastName: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  const siteOrders = orders.filter((o) => o.source === 'SITE')

  // ── Revenue totals (site-only, matches original scope) ─────────────────

  const thisMonthRevenue = sumAmount(
    siteOrders.filter((o) => o.createdAt.getTime() >= thisMonth.start.getTime())
  )
  const lastMonthRevenue = sumAmount(
    siteOrders.filter(
      (o) =>
        o.createdAt.getTime() >= lastMonth.start.getTime() &&
        o.createdAt.getTime() <= lastMonth.end.getTime()
    )
  )
  const monthlyChange =
    lastMonthRevenue === 0 ? null : ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100

  // ── Orders by type (all sources, matches original scope) ───────────────

  const typeMap = new Map<string, { count: number; total: number }>()
  for (const o of orders) {
    const prev = typeMap.get(o.type) ?? { count: 0, total: 0 }
    typeMap.set(o.type, { count: prev.count + 1, total: prev.total + Number(o.totalAmount) })
  }
  const ordersByType = Array.from(typeMap.entries())
    .map(([type, { count, total }]) => ({ type, count, total }))
    .sort((a, b) => b.total - a.total)

  const totalAdoptionRevenue = ordersByType.find((o) => o.type === 'ADOPTION_FEE')?.total ?? 0

  // ── Monthly chart (all sources, matches original scope) ────────────────

  const monthlyData = months.map(({ label, start, end }) => ({
    label,
    total: sumAmount(
      orders.filter((o) => {
        const t = o.createdAt.getTime()
        return t >= start.getTime() && t <= end.getTime()
      })
    )
  }))

  // ── Recent orders (site-only, latest 8) ─────────────────────────────────

  const recentOrders = siteOrders.slice(0, 8).map((o) => ({
    id: o.id,
    total: Number(o.totalAmount),
    createdAt: o.createdAt.toISOString(),
    name:
      o.user?.firstName && o.user?.lastName
        ? `${o.user.firstName} ${o.user.lastName}`
        : (o.user?.email ?? 'Unknown')
  }))

  return {
    thisMonthRevenue,
    lastMonthRevenue,
    monthlyChange,
    ordersByType,
    totalAdoptionRevenue,
    monthlyData,
    recentOrders
  }
}
