'use server'

import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'

export const setPrimaryAuctionItemPhoto = async (photoId: string, itemId: string, auctionId: string) => {
  try {
    await prisma.auctionItemPhoto.updateMany({
      where: { itemId },
      data: { isPrimary: false }
    })

    await prisma.auctionItemPhoto.update({
      where: { id: photoId },
      data: { isPrimary: true }
    })

    return { success: true }
  } catch (error) {
    await createLog('error', 'Failed to set primary auction item photo', {
      photoId,
      itemId,
      auctionId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return { success: false, error: 'Failed to set primary photo' }
  }
}
