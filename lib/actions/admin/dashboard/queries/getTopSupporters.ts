import prisma from 'prisma/client'
import { requireAdmin } from 'lib/auth/guards'

export async function getTopSupporters(limit = 5) {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  const grouped = await prisma.order.groupBy({
    by: ['userId'],
    where: { status: 'CONFIRMED', source: 'SITE', userId: { not: null } },
    _sum: { totalAmount: true, refundedAmount: true },
    _count: { id: true }
  })

  // Ranked on what they kept giving, not what they were first charged. The database can't sort by
  // that difference inside a groupBy, so it's sorted here
  const ranked = grouped
    .map((g) => ({
      userId: g.userId!,
      totalGiven: Number(g._sum.totalAmount ?? 0) - Number(g._sum.refundedAmount ?? 0),
      orderCount: g._count.id
    }))
    .filter((g) => g.totalGiven > 0)
    .sort((a, b) => b.totalGiven - a.totalGiven)
    .slice(0, limit)

  const users = ranked.length
    ? await prisma.user.findMany({
        where: { id: { in: ranked.map((r) => r.userId) } },
        select: { id: true, firstName: true, lastName: true, lastGeoCity: true, lastGeoRegion: true, image: true }
      })
    : []

  const userMap = new Map(users.map((u) => [u.id, u]))

  return {
    success: true,
    data: ranked.map((r) => {
      const user = userMap.get(r.userId)
      return {
        userId: r.userId,
        name: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Unknown',
        location: [user?.lastGeoCity, user?.lastGeoRegion].filter(Boolean).join(', ') || null,
        image: user?.image ?? null,
        totalGiven: r.totalGiven,
        orderCount: r.orderCount
      }
    }),
    error: null
  }
}
