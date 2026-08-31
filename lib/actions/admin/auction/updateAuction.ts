'use server'

import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { AdminFailure, requireAdmin } from '../../auth/requireAdmin'
import { getErrorMessage } from 'app/utils/_error.utils'

export const updateAuction = async (
  id: string,
  data: { startDate: Date; endDate: Date; title: string; goal: number; customAuctionLink: string }
) => {
  const gate = await requireAdmin()
  if (!gate.ok) return { success: false, error: (gate as AdminFailure).error, data: null }

  if (!id) {
    return { success: false, error: 'Missing id', data: null }
  }

  if (data.startDate && data.endDate && data.startDate >= data.endDate) {
    return { success: false, error: 'Start date must be before end date', data: null }
  }

  try {
    await prisma.auction.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title.trim() }),
        ...(data.goal && { goal: data.goal }),
        ...(data.customAuctionLink && { customAuctionLink: data.customAuctionLink.trim() }),
        ...(data.startDate && { startDate: data.startDate }),
        ...(data.endDate && { endDate: data.endDate })
      }
    })

    return { success: true, error: null, data: null }
  } catch (error) {
    await createLog('error', 'Failed to update auction', {
      auctionId: id,
      updatedBy: gate.userId,
      error: getErrorMessage(error)
    })

    return { success: false, error: 'Failed to update auction. Please try again.', data: null }
  }
}
