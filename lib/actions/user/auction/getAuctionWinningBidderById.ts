import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { AuthFailure, requireAuth } from '../../auth/requireAuth'

export const getAuctionWinningBidderById = async (id: string) => {
  try {
    const gate = await requireAuth()
    if (!gate.ok) return { success: false, error: (gate as AuthFailure).error, data: null }

    const winningBidder = await prisma.auctionWinningBidder.findUnique({
      where: { id },
      include: {
        auction: {
          select: { id: true, title: true, customAuctionLink: true }
        },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, address: true }
        },
        auctionItems: {
          include: {
            photos: {
              orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }]
            }
          }
        }
      }
    })

    if (!winningBidder) return { success: false, error: 'Not found', data: null }

    // Ensure the record belongs to the session user
    if (winningBidder.userId !== gate.userId) {
      return { success: false, error: 'Unauthorized', data: null }
    }

    return {
      success: true,
      data: {
        ...winningBidder,
        processingFee: winningBidder.processingFee != null ? Number(winningBidder.processingFee) : null,
        totalPrice: winningBidder.totalPrice != null ? Number(winningBidder.totalPrice) : null,
        itemSoldPrice: winningBidder.itemSoldPrice != null ? Number(winningBidder.itemSoldPrice) : null,
        shipping: winningBidder.shipping != null ? Number(winningBidder.shipping) : null,
        auctionItems: winningBidder.auctionItems.map((item) => ({
          ...item,
          startingPrice: item.startingPrice ? Number(item.startingPrice) : null,
          buyNowPrice: item.buyNowPrice ? Number(item.buyNowPrice) : null,
          currentPrice: item.currentPrice ? Number(item.currentPrice) : null,
          currentBid: item.currentBid ? Number(item.currentBid) : null,
          minimumBid: item.minimumBid ? Number(item.minimumBid) : null,
          soldPrice: item.soldPrice ? Number(item.soldPrice) : null,
          shippingCosts: item.shippingCosts ? Number(item.shippingCosts) : null
        }))
      }
    }
  } catch (error) {
    await createLog('error', 'Failed to fetch auction winning bidder', {
      id,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return { success: false, error: 'Failed to fetch data', data: null }
  }
}
