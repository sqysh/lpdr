import prisma from 'prisma/client'
import { monthRange } from 'app/utils/_date.utils'

export async function getUserStats() {
  const now = new Date()
  const thisMonth = monthRange(now.getFullYear(), now.getMonth())

  const [totalUsers, newThisMonth] = await Promise.all([
    prisma.user.count({ where: { role: 'PACK_MEMBER' } }),
    prisma.user.count({ where: { role: 'PACK_MEMBER', createdAt: { gte: thisMonth.start } } })
  ])

  return { totalUsers, newThisMonth }
}
