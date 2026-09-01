import { createLog } from 'lib/actions/log/createLog'
import { pusherTrigger } from 'lib/pusher/pusher.utils'
import { processAutoPay, resolveAuctionWinners, sendWinnerEmail } from 'lib/utils/end-auction.utils'
import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import prisma from 'prisma/client'

export async function endAuctionCore(
  overrideAuctionId?: string
): Promise<{ success: boolean; error?: string }> {
  const start = Date.now()
  try {
    const now = new Date()

    const auctionWhere = overrideAuctionId
      ? { id: overrideAuctionId }
      : { status: 'ACTIVE' as const, endDate: { lte: now } }

    const [auction, topBidsAggregate] = await Promise.all([
      prisma.auction.findFirst({
        where: auctionWhere,
        select: {
          id: true,
          title: true,
          customAuctionLink: true,
          _count: { select: { items: true, bidders: true } }
        }
      }),
      prisma.auctionBid.aggregate({
        where: {
          auction: overrideAuctionId
            ? { id: overrideAuctionId }
            : { status: 'ACTIVE', endDate: { lte: now } },
          status: 'TOP_BID'
        },
        _sum: { bidAmount: true }
      })
    ])

    if (!auction) {
      await createLog('info', '[CRON] end-auction', {
        cronName: 'end-auction',
        status: 'skipped',
        durationMs: Date.now() - start,
        detail: 'No active auctions past end date'
      })
      return { error: 'No auctions found with ACTIVE status past their end date', success: false }
    }

    await prisma.auction.update({
      where: { id: auction.id },
      data: { status: 'ENDED' }
    })

    revalidateTag('auction', 'max')

    await pusherTrigger(`auction-${auction.id}`, 'auction-ended', {
      customAuctionLink: auction.customAuctionLink,
      auctionTitle: auction.title,
      totalRaised: Number(topBidsAggregate._sum.bidAmount ?? 0),
      itemCount: auction._count.items,
      bidderCount: auction._count.bidders,
      endedAt: now.toISOString()
    })

    const winners = await resolveAuctionWinners(auction.id)

    await Promise.all(
      winners.map((winner) => {
        const sendPaymentRequestEmail = () =>
          sendWinnerEmail({
            email: winner.user.email,
            firstName: winner.user.firstName ?? 'Friend',
            auctionId: auction.id,
            winningBidderId: winner.winningBidderId,
            items: winner.items,
            totalPrice: winner.totalPrice
          })

        return processAutoPay(winner, auction, sendPaymentRequestEmail)
      })
    )

    await createLog('info', '[CRON] end-auction', {
      cronName: 'end-auction',
      status: 'success',
      durationMs: Date.now() - start,
      detail: `Ended auction ${auction.id} — ${winners.length} winner(s)`
    })

    return { success: true }
  } catch (error) {
    await createLog('error', '[CRON] end-auction', {
      cronName: 'end-auction',
      status: 'error',
      durationMs: Date.now() - start,
      detail: error instanceof Error ? error.message : 'Unknown error'
    })
    return { error: 'Failed to end auctions', success: false }
  }
}

export async function GET(request: Request) {
  const isDev = process.env.NODE_ENV === 'development'

  if (!isDev) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const result = await endAuctionCore()

  return result.success
    ? NextResponse.json({ success: true })
    : NextResponse.json({ error: result.error }, { status: 500 })
}
