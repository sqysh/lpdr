'use server'

import prisma from 'prisma/client'
import { requireSuper } from 'lib/auth/guards'
import { createLog } from '../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'

/** Open anomalies only. A dismissed one is something already dealt with, not a live problem. */
export async function getAuctionAnomalies() {
  const gate = await requireSuper()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  try {
    const anomalies = await prisma.auctionAnomaly.findMany({
      where: { dismissed: false },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        type: true,
        itemId: true,
        itemName: true,
        message: true,
        createdAt: true,
        auction: { select: { id: true, title: true } }
      }
    })

    return { success: true, data: anomalies, error: null }
  } catch (error) {
    await createLog('error', 'Failed to fetch auction anomalies', { error: getErrorMessage(error) })
    return { success: false, data: null, error: 'Failed to load anomalies' }
  }
}

export type AuctionAnomaly = NonNullable<Awaited<ReturnType<typeof getAuctionAnomalies>>['data']>[number]
