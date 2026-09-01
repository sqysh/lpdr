'use server'

import { revalidateTag } from 'next/cache'
import { createLog } from 'lib/actions/log/createLog'
import prisma from 'prisma/client'
import { getErrorMessage } from 'lib/utils/error.utils'
import { requireSuper } from 'lib/auth/guards'

export async function revertAuctionToDraft(auctionId: string) {
  // REVERT to requireSuper before going live with real Stripe keys.
  const gate = await requireSuper()
  if (gate.ok === false) return { success: false, error: gate.error }

  try {
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      select: { id: true, title: true, status: true }
    })

    if (!auction) return { success: false, error: 'Auction not found' }
    if (auction.status !== 'ACTIVE') return { success: false, error: 'Auction is not ACTIVE' }

    await prisma.auction.update({
      where: { id: auctionId },
      data: { status: 'DRAFT' }
    })

    revalidateTag('auction', 'max')

    await createLog('warn', 'Auction reverted to draft', {
      auctionId,
      auctionTitle: auction.title,
      revertedBy: gate.userId
    })

    return { success: true }
  } catch (error) {
    await createLog('error', 'Failed to revert auction to draft', {
      auctionId,
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to revert auction' }
  }
}
