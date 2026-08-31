'use server'

import prisma from 'prisma/client'
import { getErrorMessage } from 'app/utils/_error.utils'
import { createLog } from '../../log/createLog'
import { requireSuper, SuperFailure } from '../../auth/requireSuper'

export async function diagnoseMigration(userId: string) {
  const gate = await requireSuper()
  if (!gate.ok) return { success: false, error: (gate as SuperFailure).error, data: null }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, hasMigrated: true, migratedAt: true }
    })

    if (!user) return { success: false, error: 'User not found', data: null }

    const normalizedEmail = user.email.toLowerCase().trim()

    const [mongoUser, donations, orders, adoptionFees, auctionWinners, instantBuyers, bids] =
      await Promise.all([
        prisma.mongoUser.findUnique({ where: { email: normalizedEmail } }),
        prisma.mongoDonation.count({ where: { email: normalizedEmail } }),
        prisma.mongoOrder.count({ where: { email: normalizedEmail } }),
        prisma.mongoAdoptionFee.count({ where: { email: normalizedEmail } }),
        prisma.mongoAuctionWinner.count({ where: { email: normalizedEmail } }),
        prisma.mongoInstantBuyer.count({ where: { email: normalizedEmail } }),
        prisma.mongoBid.count({ where: { email: normalizedEmail } })
      ])

    return {
      success: true,
      error: null,
      data: {
        hasMigrated: user.hasMigrated,
        migratedAt: user.migratedAt,
        hasStagingUserRecord: !!mongoUser,
        remainingStagingRecords: {
          donations,
          orders,
          adoptionFees,
          auctionWinners,
          instantBuyers,
          bids
        },
        totalRemaining: donations + orders + adoptionFees + auctionWinners + instantBuyers + bids
      }
    }
  } catch (error) {
    await createLog('error', 'Failed to diagnose migration', {
      userId,
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to diagnose migration', data: null }
  }
}
