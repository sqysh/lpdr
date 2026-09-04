'use server'

import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { serialize } from 'lib/utils/serializers.utils'
import { getErrorMessage } from 'lib/utils/error.utils'
import type { ActionResult } from 'types/action.types'
import { auctionLiveArgs, IAuctionLive } from 'types/auction.types'

export default async function getPublicAuctions(): Promise<ActionResult<IAuctionLive[]>> {
  try {
    const auctions = await prisma.auction.findMany({
      where: {
        OR: [{ status: { in: ['ACTIVE', 'ENDED'] } }, { status: 'DRAFT', isPubliclyVisible: true }]
      },
      ...auctionLiveArgs,
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, data: serialize(auctions) }
  } catch (error) {
    await createLog('error', 'Failed to get public auctions', { error: getErrorMessage(error) })
    return { success: false, data: null, error: 'Failed to load auctions' }
  }
}
