import 'server-only'
import prisma from 'prisma/client'

export async function getAdminBadges() {
  const [memorialsPending, agreementsWaiting] = await Promise.all([
    prisma.memorial.count({ where: { status: 'PENDING' } }),
    prisma.adoptionAgreement.count({ where: { status: 'PAID' } })
  ])

  return { memorialsPending, agreementsWaiting }
}

export type AdminBadges = Awaited<ReturnType<typeof getAdminBadges>>
