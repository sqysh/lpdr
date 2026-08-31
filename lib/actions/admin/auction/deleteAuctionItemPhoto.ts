'use server'

import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { AdminFailure, requireAdmin } from '../../auth/requireAdmin'
import { getErrorMessage } from 'app/utils/_error.utils'

export const deleteAuctionItemPhoto = async (photoId: string, auctionId: string) => {
  const gate = await requireAdmin()
  if (!gate.ok) return { success: false, error: (gate as AdminFailure).error, data: null }

  try {
    await prisma.auctionItemPhoto.delete({ where: { id: photoId } })

    return { success: true, error: null }
  } catch (error) {
    await createLog('error', 'Failed to delete auction item photo', {
      photoId,
      auctionId,
      deletedBy: gate.userId,
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to delete photo' }
  }
}
