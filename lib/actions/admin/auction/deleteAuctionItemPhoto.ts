'use server'

import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { requireAdmin } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import type { ActionResult } from 'types/action.types'

export const deleteAuctionItemPhoto = async (photoId: string, auctionId: string): Promise<ActionResult<null>> => {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  try {
    const photo = await prisma.auctionItemPhoto.findFirst({
      where: { id: photoId, item: { auctionId } },
      select: { id: true, itemId: true, isPrimary: true }
    })

    if (!photo) return { success: false, data: null, error: 'Photo not found' }

    await prisma.auctionItemPhoto.delete({ where: { id: photoId } })

    // Promote the next photo so the item always has a primary
    if (photo.isPrimary) {
      const next = await prisma.auctionItemPhoto.findFirst({
        where: { itemId: photo.itemId },
        orderBy: { sortOrder: 'asc' },
        select: { id: true }
      })

      if (next) {
        await prisma.auctionItemPhoto.update({
          where: { id: next.id },
          data: { isPrimary: true }
        })
      }
    }

    await createLog('info', 'Auction item photo deleted', {
      photoId,
      auctionItemId: photo.itemId,
      auctionId,
      deletedBy: gate.userId
    })

    return { success: true, data: null }
  } catch (error) {
    await createLog('error', 'Failed to delete auction item photo', {
      photoId,
      auctionId,
      deletedBy: gate.userId,
      error: getErrorMessage(error)
    })
    return { success: false, data: null, error: 'Failed to delete photo' }
  }
}
