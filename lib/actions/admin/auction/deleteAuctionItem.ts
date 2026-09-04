'use server'

import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { requireAdmin } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import type { ActionResult } from 'types/_action.types'

export const deleteAuctionItem = async (id: string, auctionId: string): Promise<ActionResult<null>> => {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  try {
    const item = await prisma.auctionItem.findFirst({
      where: { id, auctionId },
      select: { name: true, totalBids: true, auction: { select: { status: true } } }
    })

    if (!item) return { success: false, data: null, error: 'Item not found' }

    if (item.auction.status === 'ACTIVE') {
      return {
        success: false,
        data: null,
        error: 'Items cannot be deleted while the auction is live'
      }
    }

    if (item.totalBids > 0) {
      return {
        success: false,
        data: null,
        error: `${item.name} has ${item.totalBids} bid${item.totalBids === 1 ? '' : 's'} and cannot be deleted.`
      }
    }

    await prisma.auctionItem.delete({ where: { id } })

    await createLog('info', 'Auction item deleted', {
      auctionItemId: id,
      auctionId,
      name: item.name,
      deletedBy: gate.userId
    })

    return { success: true, data: null }
  } catch (error) {
    await createLog('error', 'Failed to delete auction item', {
      auctionItemId: id,
      auctionId,
      error: getErrorMessage(error)
    })
    return { success: false, data: null, error: 'Failed to delete auction item' }
  }
}
