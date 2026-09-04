'use server'

import prisma from 'prisma/client'
import { getErrorMessage } from 'lib/utils/error.utils'
import { createLog } from '../../log/createLog'

export default async function getDraftOrActiveAuction() {
  try {
    const auction = await prisma.auction.findFirst({
      where: { status: { in: ['ACTIVE', 'DRAFT'] } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        startDate: true,
        endDate: true,
        customAuctionLink: true
      }
    })

    return { success: true, error: null, data: auction }
  } catch (error) {
    await createLog('error', 'Failed to fetch draft or active auction', { error: getErrorMessage(error) })
    return { success: false, error: 'Failed to load auction', data: null }
  }
}
