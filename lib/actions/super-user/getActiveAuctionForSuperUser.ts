'use server'

import prisma from 'prisma/client'

export default async function getActiveAuctionForSuperuser() {
  try {
    const auction = await prisma.auction.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        items: {
          include: {
            photos: true,
            bids: {
              orderBy: { createdAt: 'desc' },
              include: { user: { select: { id: true, email: true } } }
            },
            instantBuyers: {
              include: { user: { select: { id: true, email: true } } }
            }
          }
        },
        bids: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, email: true } } }
        },
        bidders: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                anonymousBidding: true
              }
            }
          }
        },
        instantBuyers: {
          include: { user: { select: { id: true, email: true } } }
        },
        anomalies: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!auction) return { success: true, data: null }

    return {
      success: true,
      data: {
        ...auction,
        goal: auction.goal !== null ? Number(auction.goal) : null,
        totalAuctionRevenue: Number(auction.totalAuctionRevenue),
        items: auction.items.map((item) => ({
          ...item,
          startingPrice: item.startingPrice != null ? Number(item.startingPrice) : null,
          buyNowPrice: item.buyNowPrice != null ? Number(item.buyNowPrice) : null,
          currentPrice: item.currentPrice != null ? Number(item.currentPrice) : null,
          currentBid: item.currentBid != null ? Number(item.currentBid) : null,
          minimumBid: item.minimumBid != null ? Number(item.minimumBid) : null,
          soldPrice: item.soldPrice != null ? Number(item.soldPrice) : null,
          shippingCosts: item.shippingCosts != null ? Number(item.shippingCosts) : null,
          bids: item.bids.map((bid) => ({
            ...bid,
            bidAmount: Number(bid.bidAmount)
          })),
          instantBuyers: item.instantBuyers.map((b) => ({
            ...b,
            totalPrice: b.totalPrice != null ? Number(b.totalPrice) : null
          }))
        })),
        bids: auction.bids.map((bid) => ({
          ...bid,
          bidAmount: Number(bid.bidAmount)
        })),
        instantBuyers: auction.instantBuyers.map((b) => ({
          ...b,
          totalPrice: b.totalPrice != null ? Number(b.totalPrice) : null
        })),
        anomalies: auction.anomalies.map((a) => ({
          ...a,
          metadata: a.metadata ?? null
        }))
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
