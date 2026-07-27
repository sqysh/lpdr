'use server'

import prisma from 'prisma/client'
import { getErrorMessage } from 'app/utils/_error.utils'
import { AdminFailure, requireAdmin } from '../../auth/requireAdmin'
import { createLog } from '../../log/createLog'

export default async function getUsers() {
  const gate = await requireAdmin()
  if (!gate.ok) return { success: false, error: (gate as AdminFailure).error, data: null }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        role: true,
        firstName: true,
        lastName: true,
        email: true,
        hasMigrated: true,
        _count: {
          select: { paymentMethods: true }
        }
      }
    })

    const emails = users.map((u) => u.email.toLowerCase().trim())

    const [
      mongoUsers,
      donations,
      orders,
      adoptionFees,
      auctionWinners,
      instantBuyers,
      bids,
      productOrders,
      ecardOrders,
      welcomeWienerOrders
    ] = await Promise.all([
      prisma.mongoUser.findMany({ where: { email: { in: emails } }, select: { email: true } }),
      prisma.mongoDonation.groupBy({
        by: ['email'],
        where: { email: { in: emails } },
        _count: true
      }),
      prisma.mongoOrder.groupBy({ by: ['email'], where: { email: { in: emails } }, _count: true }),
      prisma.mongoAdoptionFee.groupBy({
        by: ['email'],
        where: { email: { in: emails } },
        _count: true
      }),
      prisma.mongoAuctionWinner.groupBy({
        by: ['email'],
        where: { email: { in: emails } },
        _count: true
      }),
      prisma.mongoInstantBuyer.groupBy({
        by: ['email'],
        where: { email: { in: emails } },
        _count: true
      }),
      prisma.mongoBid.groupBy({ by: ['email'], where: { email: { in: emails } }, _count: true }),
      prisma.mongoProductOrder.groupBy({
        by: ['email'],
        where: { email: { in: emails } },
        _count: true
      }),
      prisma.mongoEcardOrder.groupBy({
        by: ['email'],
        where: { email: { in: emails } },
        _count: true
      }),
      prisma.mongoWelcomeWienerOrder.groupBy({
        by: ['email'],
        where: { email: { in: emails } },
        _count: true
      })
    ])

    const stagingEmailSet = new Set(mongoUsers.map((m) => m.email))

    const pendingMap = new Map<string, number>()
    for (const group of [
      ...donations,
      ...orders,
      ...adoptionFees,
      ...auctionWinners,
      ...instantBuyers,
      ...bids,
      ...productOrders,
      ...ecardOrders,
      ...welcomeWienerOrders
    ]) {
      pendingMap.set(group.email, (pendingMap.get(group.email) ?? 0) + group._count)
    }

    const data = users.map((u) => {
      const normalizedEmail = u.email.toLowerCase().trim()
      const pendingCount = pendingMap.get(normalizedEmail) ?? 0
      const hasStagingRecord = stagingEmailSet.has(normalizedEmail)
      const paymentMethodCount = u._count.paymentMethods

      let migrationStatus: 'migrated' | 'not-needed' | 'pending'

      if (u.hasMigrated) {
        migrationStatus = 'migrated'
      } else if (hasStagingRecord || pendingCount > 0) {
        migrationStatus = 'pending'
      } else {
        migrationStatus = 'not-needed'
      }
      return {
        ...u,
        migrationStatus,
        pendingMigrationCount: pendingCount,
        paymentMethodCount
      }
    })

    return { success: true, data, error: null }
  } catch (error) {
    await createLog('error', 'Failed to get users', {
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to get users. Please try again.', data: null }
  }
}
