import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { AuctionStatus } from '@prisma/client'
import { requireAdmin } from 'lib/auth/guards'
import { serialize } from 'lib/utils/serializers.utils'
import { getErrorMessage } from 'lib/utils/error.utils'
import type { ActionResult } from 'types/action.types'
import { auctionListArgs, IAuction } from 'types/auction.types'

export default async function getAuctions({ status }: { status: AuctionStatus[] }): Promise<ActionResult<IAuction[]>> {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  try {
    const auctions = await prisma.auction.findMany({
      where: { status: { in: status } },
      ...auctionListArgs,
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, data: serialize(auctions) }
  } catch (error) {
    await createLog('error', 'Failed to get auctions', { status, error: getErrorMessage(error) })
    return { success: false, data: null, error: 'Failed to load auctions' }
  }
}
