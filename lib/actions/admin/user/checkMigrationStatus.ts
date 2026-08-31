'use server'

import prisma from 'prisma/client'
import { AdminFailure, requireAdmin } from '../../auth/requireAdmin'
import { getErrorMessage } from 'app/utils/_error.utils'
import { createLog } from '../../log/createLog'

export async function checkMigrationStatus(email: string) {
  const gate = await requireAdmin()
  if (!gate.ok) return { success: false, error: (gate as AdminFailure).error, data: null }

  try {
    const normalizedEmail = email.toLowerCase().trim()

    const [donations, orders, adoptionFees, auctionWinners, instantBuyers, bids] =
      await Promise.all([
        prisma.mongoDonation.count({ where: { email: normalizedEmail } }),
        prisma.mongoOrder.count({ where: { email: normalizedEmail } }),
        prisma.mongoAdoptionFee.count({ where: { email: normalizedEmail } }),
        prisma.mongoAuctionWinner.count({ where: { email: normalizedEmail } }),
        prisma.mongoInstantBuyer.count({ where: { email: normalizedEmail } }),
        prisma.mongoBid.count({ where: { email: normalizedEmail } })
      ])

    const pendingCount = donations + orders + adoptionFees + auctionWinners + instantBuyers + bids

    return {
      success: true,
      error: null,
      data: {
        hasPendingMigration: pendingCount > 0,
        pendingCount
      }
    }
  } catch (error) {
    await createLog('error', 'Failed to check migration status', {
      email,
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to check migration status', data: null }
  }
}
