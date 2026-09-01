'use server'

import { revalidateTag } from 'next/cache'
import { createLog } from 'lib/actions/log/createLog'
import prisma from 'prisma/client'
import { pusherTrigger } from 'lib/pusher/pusher.utils'
import { getErrorMessage } from 'app/utils/_error.utils'
import { requireSuper } from 'lib/auth/guards'

export async function startAuction(auctionId: string) {
  // REVERT to requireSuper before going live with real Stripe keys.
  const gate = await requireSuper()
  if (gate.ok === false) return { success: false, error: gate.error }

  try {
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      select: {
        id: true,
        title: true,
        status: true,
        endDate: true,
        customAuctionLink: true,
        _count: { select: { items: true } }
      }
    })

    if (!auction) return { success: false, error: 'Auction not found' }
    if (auction.status !== 'DRAFT')
      return { success: false, error: 'Auction is not in DRAFT status' }

    await prisma.auction.update({
      where: { id: auctionId },
      data: { status: 'ACTIVE' }
    })

    revalidateTag('auction', 'max')

    await Promise.all([
      pusherTrigger(`auction-${auctionId}`, 'auction-started', {
        auctionId: auction.id,
        auctionTitle: auction.title,
        itemCount: auction._count.items,
        endDate: auction.endDate.toISOString(),
        timestamp: new Date().toISOString(),
        customAuctionLink: auction.customAuctionLink
      }),
      createLog('info', 'Auction started manually', {
        auctionId,
        auctionTitle: auction.title,
        startedBy: gate.userId
      })
    ])

    return { success: true }
  } catch (error) {
    await createLog('error', 'Failed to start auction', {
      auctionId,
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to start auction' }
  }
}
