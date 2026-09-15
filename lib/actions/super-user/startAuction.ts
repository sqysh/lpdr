'use server'

import { createLog } from 'lib/actions/log/createLog'
import prisma from 'prisma/client'
import { getErrorMessage } from 'lib/utils/error.utils'
import { requireSuper } from 'lib/auth/guards'
import { activateAuctions, AUCTION_START_SELECT } from 'lib/auction/activateAuctions'

export async function startAuction(auctionId: string) {
  const gate = await requireSuper()
  if (gate.ok === false) return { success: false, error: gate.error }

  try {
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      select: { ...AUCTION_START_SELECT, status: true }
    })

    if (!auction) return { success: false, error: 'Auction not found' }
    if (auction.status !== 'DRAFT') return { success: false, error: 'Auction is not in DRAFT status' }

    await activateAuctions([auction])

    await createLog('info', 'Auction started manually', {
      auctionId,
      auctionTitle: auction.title,
      startedBy: gate.userId
    })

    return { success: true }
  } catch (error) {
    await createLog('error', 'Failed to start auction', { auctionId, error: getErrorMessage(error) })
    return { success: false, error: 'Failed to start auction' }
  }
}
