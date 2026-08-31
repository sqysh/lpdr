import prisma from 'prisma/client'

export async function getTopSupporters(limit = 5) {
  const grouped = await prisma.order.groupBy({
    by: ['userId'],
    where: { status: 'CONFIRMED', source: 'SITE', userId: { not: null } },
    _sum: { totalAmount: true },
    _count: { id: true },
    orderBy: { _sum: { totalAmount: 'desc' } },
    take: limit
  })

  const userIds = grouped.map((g) => g.userId).filter((id): id is string => !!id)

  const users = userIds.length
    ? await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          lastGeoCity: true,
          lastGeoRegion: true,
          image: true
        }
      })
    : []

  const userMap = new Map(users.map((u) => [u.id, u]))

  return grouped.map((g) => {
    const user = userMap.get(g.userId!)
    return {
      userId: g.userId,
      name: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Unknown',
      location: [user?.lastGeoCity, user?.lastGeoRegion].filter(Boolean).join(', ') || null,
      image: user?.image ?? null,
      totalGiven: Number(g._sum.totalAmount ?? 0),
      orderCount: g._count.id
    }
  })
}
