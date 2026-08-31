'use server'

import prisma from 'prisma/client'
import { createLog } from '../log/createLog'
import { requireSuper, SuperFailure } from '../auth/requireSuper'

export default async function deleteBid(bidId: string) {
  const gate = await requireSuper()
  if (gate.ok === false) return { success: false, error: (gate as SuperFailure).error }

  try {
    const bid = await prisma.auctionBid.findUnique({
      where: { id: bidId },
      include: { auctionItem: true }
    })

    if (!bid) return { success: false, error: 'Bid not found' }

    const nextTopBid = await prisma.auctionBid.findFirst({
      where: { auctionItemId: bid.auctionItemId, id: { not: bidId } },
      orderBy: { bidAmount: 'desc' }
    })

    await prisma.$transaction([
      prisma.auctionBid.delete({ where: { id: bidId } }),
      prisma.auctionItem.update({
        where: { id: bid.auctionItemId },
        data: {
          currentBid: nextTopBid ? nextTopBid.bidAmount : bid.auctionItem.startingPrice,
          currentPrice: nextTopBid ? nextTopBid.bidAmount : bid.auctionItem.startingPrice,
          topBidder: nextTopBid ? nextTopBid.bidderName : null,
          totalBids: { decrement: 1 }
        }
      }),
      ...(nextTopBid ? [prisma.auctionBid.update({ where: { id: nextTopBid.id }, data: { status: 'TOP_BID' } })] : [])
    ])

    await createLog('warn', 'Bid deleted by superuser', {
      bidId,
      auctionItemId: bid.auctionItemId,
      bidAmount: Number(bid.bidAmount),
      deletedBy: gate.userId
    })

    return { success: true }
  } catch (error) {
    await createLog('error', 'Failed to delete bid', {
      bidId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return { success: false, error: 'Failed to delete bid' }
  }
}
