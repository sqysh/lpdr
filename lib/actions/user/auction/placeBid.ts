'use server'

import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { pusherSuperuser, pusherTrigger } from 'lib/pusher/pusher.utils'
import { requireAuth } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import { sendOutbidEmail } from 'lib/email/sendOutbidEmail'
import { PreviousTopBid } from 'types/auction-bid'
import { stampUserGeoFromRequest } from '../../_infra/stampUserGeoFromRequest'

export async function placeBid(auctionItemId: string, bidAmount: number) {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, error: 'You must be logged in to place a bid.' }

  const userId = gate.userId
  const email = gate.email!

  let previousTopBid: PreviousTopBid = null

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        await tx.$queryRaw`
          SELECT id FROM "AuctionItem"
          WHERE id = ${auctionItemId}
          FOR UPDATE
        `

        const auctionItem = await tx.auctionItem.findUnique({
          where: { id: auctionItemId },
          include: { auction: true }
        })

        if (!auctionItem) throw new Error('Auction item not found.')
        if (auctionItem.auction.status !== 'ACTIVE') throw new Error('This auction is not currently active.')

        const auctionId = auctionItem.auctionId
        const currentMinimum = Number(auctionItem.minimumBid ?? auctionItem.startingPrice ?? 0)

        if (bidAmount < currentMinimum) {
          throw new Error(`Minimum bid is now $${currentMinimum.toLocaleString()}. Please increase your bid.`)
        }

        previousTopBid = await tx.auctionBid.findFirst({
          where: { auctionItemId, status: 'TOP_BID' },
          include: { user: { select: { email: true, firstName: true } } }
        })

        const bidder = await tx.auctionBidder.upsert({
          where: { auctionId_userId: { auctionId, userId } },
          update: {},
          create: { auctionId, userId, status: 'REGISTERED' }
        })

        await tx.auctionBid.updateMany({
          where: { auctionItemId, status: 'TOP_BID' },
          data: { status: 'OUTBID' }
        })

        const user = await tx.user.findUnique({ where: { id: userId } })

        const bid = await tx.auctionBid.create({
          data: {
            auctionId,
            auctionItemId,
            userId,
            bidderId: bidder.id,
            bidAmount,
            email,
            bidderName: user?.anonymousBidding ? null : `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || null,
            status: 'TOP_BID'
          }
        })

        await tx.auctionItem.update({
          where: { id: auctionItemId },
          data: {
            currentBid: bidAmount,
            minimumBid: bidAmount + 1,
            totalBids: { increment: 1 },
            topBidder: user?.anonymousBidding
              ? 'Anonymous'
              : `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Anonymous'
          }
        })

        return bid
      },
      { isolationLevel: 'Serializable' }
    )

    const [updatedItem, sessionUser, details] = await Promise.all([
      prisma.auctionItem.findUnique({
        where: { id: auctionItemId },
        select: {
          id: true,
          currentBid: true,
          minimumBid: true,
          totalBids: true,
          topBidder: true,
          name: true,
          auction: true
        }
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true, email: true }
      }),
      stampUserGeoFromRequest(userId)
    ])

    const bidderName = sessionUser?.firstName
      ? `${sessionUser.firstName}${sessionUser.lastName ? ` ${sessionUser.lastName}` : ''}`
      : (sessionUser?.email ?? 'Unknown')

    try {
      await Promise.all([
        pusherTrigger(`auction-item-${auctionItemId}`, 'bid-placed', {
          bid: { ...result, bidAmount: Number(result.bidAmount) },
          auctionItem: {
            ...updatedItem,
            currentBid: Number(updatedItem?.currentBid),
            minimumBid: Number(updatedItem?.minimumBid)
          }
        }),
        createLog('info', 'Bid placed', {
          auctionItemId,
          bidAmount: Number(result.bidAmount),
          bidderId: userId,
          bidderName,
          ip: details.ip,
          device: details.device,
          city: details.geoCity,
          country: details.geoCountry
        }),
        pusherSuperuser('bid-placed', {
          auctionItemId,
          bidAmount: Number(result.bidAmount),
          bidderName,
          email: sessionUser?.email ?? null,
          itemName: updatedItem?.name ?? null,
          currentBid: Number(updatedItem?.currentBid),
          topBidder: updatedItem?.topBidder ?? null
        })
      ])
    } catch (error) {
      await createLog('warn', 'Pusher trigger failed after bid placed', {
        auctionItemId,
        bidAmount: Number(result.bidAmount),
        error: getErrorMessage(error)
      })
    }

    if (previousTopBid && previousTopBid.userId !== userId) {
      await sendOutbidEmail({
        email: previousTopBid.user.email,
        firstName: previousTopBid.user.firstName ?? 'Friend',
        itemName: updatedItem.name,
        yourBid: Number(previousTopBid.bidAmount),
        newBid: bidAmount,
        minimumBid: bidAmount + 1,
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/auctions/${updatedItem.auction.customAuctionLink}/${updatedItem.id}`
      })
    }

    return { success: true }
  } catch (error: any) {
    await createLog('error', 'Bid failed', {
      auctionItemId,
      bidAmount,
      userId,
      error: getErrorMessage(error)
    })

    if (error?.code === 'P2034') {
      const freshItem = await prisma.auctionItem.findUnique({
        where: { id: auctionItemId },
        select: { minimumBid: true, currentBid: true }
      })
      return {
        success: false,
        error: 'LOCK_NOT_ACQUIRED',
        data: {
          newMinimumBid: freshItem?.minimumBid ? Number(freshItem.minimumBid) : null,
          currentBid: freshItem?.currentBid ? Number(freshItem.currentBid) : null
        }
      }
    }

    return { success: false, error: error?.message ?? 'Something went wrong. Please try again.' }
  }
}
