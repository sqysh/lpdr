'use server'

import prisma from 'prisma/client'
import { requireSuper } from 'lib/auth/guards'
import { createLog } from '../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'

export async function dismissAuctionAnomaly(id: string) {
  const gate = await requireSuper()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  try {
    await prisma.auctionAnomaly.update({ where: { id }, data: { dismissed: true } })

    await createLog('info', 'Auction anomaly dismissed', { anomalyId: id, dismissedBy: gate.userId })

    return { success: true, data: null, error: null }
  } catch (error) {
    await createLog('error', 'Failed to dismiss auction anomaly', { anomalyId: id, error: getErrorMessage(error) })
    return { success: false, data: null, error: 'Failed to dismiss' }
  }
}
