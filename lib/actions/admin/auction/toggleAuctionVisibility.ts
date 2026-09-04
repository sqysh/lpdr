'use server'

import prisma from 'prisma/client'
import { requireAdmin } from 'lib/auth/guards'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { revalidateTag } from 'next/cache'

export async function toggleAuctionVisibility(auctionId: string) {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  try {
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      select: { isPubliclyVisible: true }
    })

    if (!auction) return { success: false, error: 'Auction not found', data: null }

    await prisma.auction.update({
      where: { id: auctionId },
      data: { isPubliclyVisible: !auction.isPubliclyVisible }
    })

    await createLog('info', 'Auction visibility toggled', {
      auctionId,
      isPubliclyVisible: !auction.isPubliclyVisible,
      toggledBy: gate.userId
    })

    revalidateTag('auction', 'max')

    return { success: true, error: null, data: null }
  } catch (error) {
    await createLog('error', 'Failed to toggle auction visibility', { auctionId, error: getErrorMessage(error) })
    return { success: false, error: 'Failed to update visibility', data: null }
  }
}
