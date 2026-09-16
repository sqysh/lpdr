import { createLog } from 'lib/actions/log/createLog'
import { pusherTrigger } from 'lib/pusher/pusher.utils'
import { resolveAuctionWinners } from 'lib/utils/end-auction/resolveAuctionWinners.util'
import { processAutoPay } from 'lib/utils/end-auction/processAutoPay.util'
import { sendWinnerEmail } from 'lib/utils/end-auction/sendWinnerEmail.util'
import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import prisma from 'prisma/client'
import { Prisma } from '@prisma/client'
import { sendResolverAlert } from 'lib/email/sendResolverAlert'

export async function endAuctionCore(overrideAuctionId?: string): Promise<{ success: boolean; error?: string }> {
  const start = Date.now()
  // Held outside the try so the catch can say which auction failed.
  let failed: { id: string; title: string } | null = null

  try {
    const now = new Date()

    /**
     * An auction is picked up if it is past its end date and its winners have not been resolved.
     * The ENDED flip happens before resolution so the public page updates immediately, which means
     * a resolver failure would otherwise leave an ENDED auction that no later run ever retries.
     * winnersResolvedAt is what makes the retry possible and stops a resolved auction recycling.
     */
    const auctionWhere: Prisma.AuctionWhereInput = overrideAuctionId
      ? { id: overrideAuctionId }
      : {
          endDate: { lte: now },
          winnersResolvedAt: null,
          status: { in: ['ACTIVE', 'ENDED'] }
        }

    const auction = await prisma.auction.findFirst({
      where: auctionWhere,
      select: {
        id: true,
        title: true,
        status: true,
        customAuctionLink: true,
        _count: { select: { items: true, bidders: true } }
      }
    })

    if (!auction) {
      await createLog('info', '[CRON] end-auction', {
        cronName: 'end-auction',
        status: 'skipped',
        durationMs: Date.now() - start,
        detail: 'No active auctions past end date'
      })
      return { error: 'No auctions found with ACTIVE status past their end date', success: false }
    }

    failed = { id: auction.id, title: auction.title }

    // Both aggregates are scoped to this auction's id rather than re-deriving the date window,
    // so the broadcast total can't pick up rows from an auction we are not ending.
    const [topBidsAggregate, instantBuyAggregate] = await Promise.all([
      prisma.auctionBid.aggregate({
        where: { auctionId: auction.id, status: 'TOP_BID' },
        _sum: { bidAmount: true }
      }),
      prisma.auctionItemInstantBuyer.aggregate({
        where: { auctionId: auction.id, paymentStatus: 'PAID' },
        _sum: { totalPrice: true }
      })
    ])

    const totalRaised = Number(topBidsAggregate._sum.bidAmount ?? 0) + Number(instantBuyAggregate._sum.totalPrice ?? 0)

    // Already ENDED means this is a retry after a failed resolution, so skip the flip and the
    // broadcast; everyone watching was told the first time round.
    if (auction.status === 'ACTIVE') {
      await prisma.auction.update({ where: { id: auction.id }, data: { status: 'ENDED' } })

      revalidateTag('auction', 'max')

      await pusherTrigger(`auction-${auction.id}`, 'auction-ended', {
        customAuctionLink: auction.customAuctionLink,
        auctionTitle: auction.title,
        totalRaised,
        itemCount: auction._count.items,
        bidderCount: auction._count.bidders,
        endedAt: now.toISOString()
      })
    }

    const winners = await resolveAuctionWinners(auction.id)

    // allSettled so one winner's failure doesn't take down the others. A rejected auto-pay still
    // leaves that winner's row AWAITING_PAYMENT, which the reminder cron picks up.
    const results = await Promise.allSettled(
      winners.map((winner) => {
        const sendPaymentRequestEmail = () =>
          sendWinnerEmail({
            email: winner.user.email,
            firstName: winner.user.firstName ?? 'Friend',
            auctionId: auction.id,
            winningBidderId: winner.winningBidderId,
            items: winner.items,
            itemsTotal: winner.itemsTotal,
            shipping: winner.shipping,
            totalPrice: winner.totalPrice
          })

        return processAutoPay(winner, auction, sendPaymentRequestEmail)
      })
    )

    const failedPayments = results.filter((r) => r.status === 'rejected')

    await prisma.auction.update({ where: { id: auction.id }, data: { winnersResolvedAt: new Date() } })

    await createLog(failedPayments.length ? 'error' : 'info', '[CRON] end-auction', {
      cronName: 'end-auction',
      status: failedPayments.length ? 'error' : 'success',
      durationMs: Date.now() - start,
      detail: `Ended auction ${auction.id}, ${winners.length} winner(s), ${failedPayments.length} payment step(s) failed`,
      ...(failedPayments.length ? { errors: failedPayments.map((f) => String(f.reason)) } : {})
    })

    return { success: true }
  } catch (error) {
    await createLog('error', '[CRON] end-auction', {
      cronName: 'end-auction',
      status: 'error',
      durationMs: Date.now() - start,
      detail: error instanceof Error ? error.message : 'Unknown error'
    })

    // Only when an auction was actually being ended. A failure before that is a cron problem,
    // not an auction sitting unresolved, and does not need waking anyone up.
    if (failed) {
      await sendResolverAlert({ auctionId: failed.id, auctionTitle: failed.title, error })
    }

    return { error: 'Failed to end auctions', success: false }
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await endAuctionCore()

  return result.success ? NextResponse.json({ success: true }) : NextResponse.json({ error: result.error }, { status: 500 })
}
