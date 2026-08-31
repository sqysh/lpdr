'use server'

import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { AdminFailure, requireAdmin } from '../../auth/requireAdmin'
import { getErrorMessage } from 'app/utils/_error.utils'

export const deleteAuctionItem = async (id: string, auctionId: string) => {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, error: (gate as AdminFailure).error, data: null }

  try {
    const item = await prisma.auctionItem.findUnique({
      where: { id },
      select: { name: true, totalBids: true, auction: { select: { status: true } } }
    })
    if (!item) return { success: false, error: 'Item not found', data: null }

    if (item.auction.status === 'ACTIVE') {
      return { success: false, error: 'Items cannot be deleted while the auction is live', data: null }
    }

    await prisma.auctionItem.delete({ where: { id } })

    await createLog('info', 'Auction item deleted', {
      auctionItemId: id,
      auctionId,
      name: item.name,
      totalBids: item.totalBids,
      deletedBy: gate.userId
    })

    return { success: true, data: null, error: null }
  } catch (error) {
    await createLog('error', 'Failed to delete auction item', {
      auctionItemId: id,
      auctionId,
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to delete auction item', data: null }
  }
}
