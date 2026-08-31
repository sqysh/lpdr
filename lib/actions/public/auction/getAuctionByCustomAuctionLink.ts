import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { IAuction } from 'types/_auction'

export const getAuctionByCustomAuctionLink = async (link: string) => {
  try {
    const auction = await prisma.auction.findUnique({
      where: { customAuctionLink: link },
      include: {
        items: {
          orderBy: { createdAt: 'asc' },
          include: {
            photos: {
              orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }]
            },
            _count: { select: { bids: true } }
          }
        },
        bidders: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true, anonymousBidding: true }
            }
          }
        },
        bids: { orderBy: { createdAt: 'desc' } },
        winningBidders: true,
        instantBuyers: true
      }
    })

    if (!auction) return { success: false, data: null }

    return {
      success: true,
      data: {
        ...auction,
        goal: Number(auction.goal),
        totalAuctionRevenue: Number(auction.totalAuctionRevenue),
        items: auction.items.map((item) => ({
          ...item,
          startingPrice: item.startingPrice ? Number(item.startingPrice) : null,
          buyNowPrice: item.buyNowPrice ? Number(item.buyNowPrice) : null,
          currentPrice: item.currentPrice ? Number(item.currentPrice) : null,
          currentBid: item.currentBid ? Number(item.currentBid) : null,
          minimumBid: item.minimumBid ? Number(item.minimumBid) : null,
          soldPrice: item.soldPrice ? Number(item.soldPrice) : null,
          shippingCosts: item.shippingCosts ? Number(item.shippingCosts) : null
        })),
        bids: auction.bids.map((bid) => ({
          ...bid,
          bidAmount: Number(bid.bidAmount)
        })),
        winningBidders: auction.winningBidders.map((wb) => ({
          ...wb,
          processingFee: wb.processingFee ? Number(wb.processingFee) : null,
          totalPrice: wb.totalPrice ? Number(wb.totalPrice) : null,
          itemSoldPrice: wb.itemSoldPrice ? Number(wb.itemSoldPrice) : null,
          shipping: wb.shipping ? Number(wb.shipping) : null
        })),
        instantBuyers: auction.instantBuyers.map((ib) => ({
          ...ib,
          totalPrice: ib.totalPrice ? Number(ib.totalPrice) : null
        }))
      } as unknown as IAuction
    }
  } catch (error) {
    await createLog('error', 'Failed to fetch auction by custom link', {
      link,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return { success: false, data: null }
  }
}
