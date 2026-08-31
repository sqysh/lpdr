import prisma from 'prisma/client'
import { createLog } from '../log/createLog'
import {
  AuctionParticipation,
  AuctionPurchase,
  Donation,
  MultiItemOrder,
  ParticipationItem,
  Subscription
} from 'types/_my-pack.types'
import { AuthFailure, requireAuth } from '../auth/requireAuth'

export const getPackMemberData = async () => {
  try {
    const gate = await requireAuth()
    if (!gate.ok) return { success: false, error: (gate as AuthFailure).error, data: null }

    const userId = gate.userId

    const [user, orders, auctionBids, paymentMethods, adoptionFees, instantBuyers] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            anonymousBidding: true,
            address: true,
            createdAt: true,
            autoPay: true,
            autoPayCoverFees: true,
            role: true,
            image: true
          }
        }),
        prisma.order.findMany({
          where: { userId },
          include: {
            items: {
              select: {
                id: true,
                iconKey: true,
                images: true,
                isPhysical: true,
                itemImage: true,
                itemName: true,
                price: true,
                size: true,
                totalPrice: true,
                quantity: true,
                itemType: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.auctionBid.findMany({
          where: { userId },
          include: {
            auctionItem: {
              include: {
                photos: {
                  orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                  take: 1
                },
                winningBidder: {
                  select: { userId: true, id: true, winningBidPaymentStatus: true, paidOn: true }
                }
              }
            },
            auction: {
              select: {
                id: true,
                title: true,
                status: true,
                endDate: true,
                customAuctionLink: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.paymentMethod.findMany({
          where: { userId },
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
        }),
        prisma.adoptionFee.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.auctionItemInstantBuyer.findMany({
          where: { userId },
          include: {
            auctionItem: {
              select: {
                id: true,
                name: true,
                photos: {
                  orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                  take: 1
                }
              }
            },
            auction: {
              select: { id: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
      ])

    if (!user) return { success: false, error: 'User not found', data: null }

    // ── Orders ────────────────────────────────────────────────────────────────

    const donations: Donation[] = orders
      .filter((o) => o.type === 'ONE_TIME_DONATION' && o.status === 'CONFIRMED')
      .map((o) => ({
        id: o.id,
        amount: Number(o.totalAmount),
        createdAt: o.createdAt,
        status: o.status
      }))

    const subscriptions: Subscription[] = orders
      .filter((o) => o.type === 'RECURRING_DONATION' && o.status === 'CONFIRMED')
      .map((o) => ({
        id: o.id,
        tierName: o.tierName ?? 'Recurring Donation',
        amount: Number(o.totalAmount),
        interval: o.recurringFrequency ?? 'MONTHLY',
        status: o.status,
        nextBillingDate: o.nextBillingDate
      }))

    const multiItemOrders: MultiItemOrder[] = orders
      .filter((o) => o.type === 'PURCHASE' && o.status === 'CONFIRMED')
      .map((o) => ({
        id: o.id,
        type: o.type,
        totalAmount: Number(o.totalAmount),
        createdAt: o.createdAt,
        status: o.status,
        shippingStatus: o.shippingStatus ?? null,
        customerName: o.customerName ?? null,
        items: o.items.map((item) => ({
          id: item.id,
          name: item.itemName ?? 'Item',
          image: item.itemImage ?? null,
          price: Number(item.price),
          quantity: item.quantity ?? 1,
          isPhysical: item.isPhysical,
          iconKey: item.iconKey ?? null,
          itemType: item.itemType ?? null
        })),
        shippingAddress: o.addressLine1
          ? {
              addressLine1: o.addressLine1,
              addressLine2: o.addressLine2 ?? null,
              city: o.city ?? null,
              state: o.state ?? null,
              zipPostalCode: o.zipPostalCode ?? null
            }
          : null
      }))

    // ── Auction instant buys ─────────────────────────────────────────────────

    const auctionPurchases: AuctionPurchase[] = instantBuyers.map((ib) => ({
      id: ib.id,
      auctionId: ib.auctionId,
      totalAmount: Number(ib.totalPrice ?? 0),
      createdAt: ib.createdAt,
      paymentStatus: ib.paymentStatus,
      items: [
        {
          id: ib.auctionItemId,
          name: ib.auctionItem.name,
          image: ib.auctionItem.photos[0]?.url ?? null
        }
      ]
    }))

    // ── Auction participation ─────────────────────────────────────────────────

    const byAuction = new Map<
      string,
      AuctionParticipation & { itemMap: Map<string, ParticipationItem> }
    >()

    for (const bid of auctionBids) {
      const auction = bid.auction

      let group = byAuction.get(auction.id)
      if (!group) {
        group = {
          auctionId: auction.id,
          auctionTitle: auction.title,
          auctionStatus: auction.status.toLowerCase(),
          auctionEndDate: auction.endDate,
          customAuctionLink: auction.customAuctionLink,
          myBidCount: 0,
          items: [],
          itemMap: new Map(),
          paymentLink: null,
          paymentStatus: null,
          paidOn: null
        }
        byAuction.set(auction.id, group)
      }

      group.myBidCount += 1

      const winner = bid.auctionItem.winningBidder
      const iWon = winner?.userId === userId

      if (iWon) {
        group.paymentLink = `/auctions/winner/${winner!.id}`
        group.paymentStatus = winner!.winningBidPaymentStatus
        group.paidOn = winner!.paidOn ?? null
      }

      let item = group.itemMap.get(bid.auctionItemId)
      if (!item) {
        item = {
          auctionItemId: bid.auctionItemId,
          itemName: bid.auctionItem.name,
          itemImage: bid.auctionItem.photos[0]?.url ?? null,
          myHighestBid: Number(bid.bidAmount),
          myBidCount: 1,
          lastBidAt: bid.createdAt,
          itemTotalBids: bid.auctionItem.totalBids,
          isWinner: iWon,
          status: bid.status
        }
        group.itemMap.set(bid.auctionItemId, item)
      } else {
        item.myBidCount += 1
        item.myHighestBid = Math.max(item.myHighestBid, Number(bid.bidAmount))
        if (bid.createdAt > item.lastBidAt) {
          item.lastBidAt = bid.createdAt
          item.status = bid.status
        }
      }
    }

    const auctionParticipation: AuctionParticipation[] = [...byAuction.values()].map(
      ({ itemMap, ...group }) => ({
        ...group,
        items: [...itemMap.values()]
      })
    )

    // ── Adoption fees ─────────────────────────────────────────────────────────

    const adoptionFeesData = adoptionFees.map((fee) => ({
      id: fee.id,
      firstName: fee.firstName,
      lastName: fee.lastName,
      feeAmount: fee.feeAmount ? Number(fee.feeAmount) : null,
      status: fee.status,
      expiresAt: fee.expiresAt,
      createdAt: fee.createdAt,
      bypassCode: fee.bypassCode
    }))

    return {
      success: true,
      data: {
        user,
        donations,
        subscriptions,
        multiItemOrders,
        auctionPurchases,
        auctionParticipation,
        paymentMethods,
        adoptionFees: adoptionFeesData
      }
    }
  } catch (error) {
    await createLog('error', 'Failed to fetch account data', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    })
    return { success: false, error: 'Failed to fetch account data', data: null }
  }
}
