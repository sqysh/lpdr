'use server'

import prisma from 'prisma/client'
import { requireSuper } from 'lib/auth/guards'

export default async function getAuctionAnomalies(auctionId: string) {
  const gate = await requireSuper()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  try {
    const anomalies = await prisma.auctionAnomaly.findMany({
      where: { auctionId },
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, error: null, data: anomalies }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch auction anomalies',
      data: null
    }
  }
}
