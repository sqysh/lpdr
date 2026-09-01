import { NextResponse } from 'next/server'
import prisma from 'prisma/client'
import { createLog } from 'lib/actions/log/createLog'
import { sendWinnerEmail } from 'lib/utils/end-auction.utils'

const MAX_REMINDERS = 5
const REMINDER_WINDOW_DAYS = 5

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const start = Date.now()
  try {
    const now = Date.now()
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000)
    const windowCutoff = new Date(now - (24 + REMINDER_WINDOW_DAYS * 24) * 60 * 60 * 1000)

    const unpaidWinners = await prisma.auctionWinningBidder.findMany({
      where: {
        winningBidPaymentStatus: 'AWAITING_PAYMENT',
        emailNotificationCount: { lt: MAX_REMINDERS },
        auction: {
          endDate: {
            lte: oneDayAgo,
            gte: windowCutoff
          }
        }
      },
      include: {
        user: {
          select: { firstName: true, email: true }
        },
        auction: {
          select: { id: true, title: true }
        },
        auctionItems: {
          select: { id: true, name: true, soldPrice: true }
        }
      }
    })

    if (unpaidWinners.length === 0) {
      await createLog('info', '[CRON] winner-payment-reminder', {
        cronName: 'winner-payment-reminder',
        status: 'skipped',
        durationMs: Date.now() - start,
        detail: 'No unpaid winners in the active reminder window'
      })
      return NextResponse.json({ success: true, reminded: 0 })
    }

    for (const winner of unpaidWinners) {
      await sendWinnerEmail({
        email: winner.user.email,
        firstName: winner.user.firstName ?? 'Friend',
        auctionId: winner.auctionId,
        winningBidderId: winner.id,
        items: winner.auctionItems.map((item) => ({
          name: item.name,
          soldPrice: Number(item.soldPrice)
        })),
        totalPrice: Number(winner.totalPrice ?? 0)
      })

      await prisma.auctionWinningBidder.update({
        where: { id: winner.id },
        data: {
          emailNotificationCount: { increment: 1 },
          auctionPaymentNotificationEmailHasBeenSent: true
        }
      })
    }

    await createLog('info', '[CRON] winner-payment-reminder', {
      cronName: 'winner-payment-reminder',
      status: 'success',
      durationMs: Date.now() - start,
      detail: `${unpaidWinners.length} reminder(s) sent — ${unpaidWinners.map((w) => w.user.email).join(', ')}`
    })

    return NextResponse.json({ success: true, reminded: unpaidWinners.length })
  } catch (error) {
    await createLog('error', '[CRON] winner-payment-reminder', {
      cronName: 'winner-payment-reminder',
      status: 'error',
      durationMs: Date.now() - start,
      detail: error instanceof Error ? error.message : 'Unknown error'
    })
    return NextResponse.json({ error: 'Failed to send payment reminders' }, { status: 500 })
  }
}
