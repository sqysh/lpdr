'use server'

import { revalidateTag } from 'next/cache'
import { createLog } from 'lib/actions/log/createLog'
import prisma from 'prisma/client'
import { getErrorMessage } from 'lib/utils/error.utils'
import { requireSuper } from 'lib/auth/guards'

/**
 * Puts an auction back to the state it was in before it started, and throws away everything that
 * happened while it ran: bids, bidders, instant buys and resolved winners. Destructive on purpose,
 * so the same auction can be run end to end repeatedly while testing.
 *
 * Orders are deliberately left alone. They are the financial record and are not owned by the
 * auction, so a revert should never be the thing that removes them.
 */
export async function revertAuctionToDraft(auctionId: string) {
  const gate = await requireSuper()
  if (gate.ok === false) return { success: false, error: gate.error }

  try {
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      select: {
        id: true,
        title: true,
        status: true,
        _count: { select: { items: true, bidders: true, bids: true, winningBidders: true } }
      }
    })

    if (!auction) return { success: false, error: 'Auction not found' }
    if (auction.status !== 'ACTIVE' && auction.status !== 'ENDED') {
      return { success: false, error: 'Only an active or ended auction can be reverted to draft' }
    }

    await prisma.$transaction([
      // Items first: their FK to the winner rows has to be cleared before those rows can go.
      // Raw because currentBid, currentPrice and minimumBid go back to each item's own
      // startingPrice, the way createAuctionItem seeds them, which updateMany cannot express.
      prisma.$executeRaw`
        UPDATE "AuctionItem"
        SET status = 'UNSOLD',
            "soldPrice" = NULL,
            "totalBids" = 0,
            "auctionWinningBidderId" = NULL,
            "currentBid" = "startingPrice",
            "currentPrice" = "startingPrice",
            "minimumBid" = "startingPrice"
        WHERE "auctionId" = ${auctionId}
      `,
      prisma.auctionBid.deleteMany({ where: { auctionId } }),
      prisma.auctionItemInstantBuyer.deleteMany({ where: { auctionId } }),
      prisma.auctionWinningBidder.deleteMany({ where: { auctionId } }),
      prisma.auctionBidder.deleteMany({ where: { auctionId } }),
      prisma.auction.update({
        where: { id: auctionId },
        data: { status: 'DRAFT', isPubliclyVisible: false, winnersResolvedAt: null, totalAuctionRevenue: 0 }
      })
    ])

    revalidateTag('auction', 'max')

    await createLog('warn', 'Auction reverted to draft', {
      auctionId,
      auctionTitle: auction.title,
      revertedFrom: auction.status,
      deleted: {
        bids: auction._count.bids,
        bidders: auction._count.bidders,
        winningBidders: auction._count.winningBidders
      },
      itemsReset: auction._count.items,
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
