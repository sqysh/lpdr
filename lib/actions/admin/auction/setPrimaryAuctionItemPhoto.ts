'use server'

import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { requireAdmin } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import type { ActionResult } from 'types/_action.types'

export const setPrimaryAuctionItemPhoto = async (
  photoId: string,
  itemId: string,
  auctionId: string
): Promise<ActionResult<null>> => {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  try {
    const photo = await prisma.auctionItemPhoto.findFirst({
      where: { id: photoId, itemId, item: { auctionId } },
      select: { id: true }
    })

    if (!photo) return { success: false, data: null, error: 'Photo not found' }

    await prisma.$transaction([
      prisma.auctionItemPhoto.updateMany({
        where: { itemId },
        data: { isPrimary: false }
      }),
      prisma.auctionItemPhoto.update({
        where: { id: photoId },
        data: { isPrimary: true }
      })
    ])

    await createLog('info', 'Primary auction item photo set', {
      photoId,
      itemId,
      auctionId,
      setBy: gate.userId
    })

    return { success: true, data: null }
  } catch (error) {
    await createLog('error', 'Failed to set primary auction item photo', {
      photoId,
      itemId,
      auctionId,
      error: getErrorMessage(error)
    })
    return { success: false, data: null, error: 'Failed to set primary photo' }
  }
}
