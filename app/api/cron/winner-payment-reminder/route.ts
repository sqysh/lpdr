import { NextResponse } from 'next/server'
import prisma from 'prisma/client'
import { createLog } from 'lib/actions/log/createLog'
import { sendWinnerEmail } from 'lib/utils/end-auction/sendWinnerEmail.util'
import { sendUnpaidWinnersAlert } from 'lib/email/sendUnpaidWinnersAlert'

const MAX_REMINDERS = 5
const REMINDER_WINDOW_DAYS = 5

const DAY_MS = 24 * 60 * 60 * 1000

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const start = Date.now()

  try {
    const now = Date.now()
    const oneDayAgo = new Date(now - DAY_MS)
    const windowCutoff = new Date(now - (1 + REMINDER_WINDOW_DAYS) * DAY_MS)

    const unpaidWinners = await prisma.auctionWinningBidder.findMany({
      where: {
        winningBidPaymentStatus: 'AWAITING_PAYMENT',
        emailNotificationCount: { lt: MAX_REMINDERS },
        // Spacing belongs to the data, not the schedule. Without this, running the cron twice in
        // a day, or hitting it by hand while testing, sends the same person two emails an hour
        // apart. updatedAt moves when the reminder below is recorded.
        updatedAt: { lt: oneDayAgo },
        auction: { endDate: { lte: oneDayAgo, gte: windowCutoff } }
      },
      include: {
        user: { select: { firstName: true, email: true } },
        auction: { select: { id: true, title: true } },
        auctionItems: { select: { id: true, name: true, soldPrice: true } }
      }
    })

    // Anyone still unpaid once the window closes stops being chased, and nothing else would say
    // so. These are uncollected cheques, so they get named rather than quietly dropped.
    const agedOut = await prisma.auctionWinningBidder.findMany({
      where: {
        winningBidPaymentStatus: 'AWAITING_PAYMENT',
        auction: { endDate: { lt: windowCutoff, gte: new Date(now - (2 + REMINDER_WINDOW_DAYS) * DAY_MS) } }
      },
      select: { id: true, totalPrice: true, user: { select: { email: true } }, auction: { select: { title: true } } }
    })

    if (agedOut.length > 0) {
      const winners = agedOut.map((w) => ({ id: w.id, email: w.user.email, owed: Number(w.totalPrice ?? 0) }))

      await createLog('warn', '[CRON] winner-payment-reminder', {
        cronName: 'winner-payment-reminder',
        status: 'attention',
        detail: `${agedOut.length} winner(s) never paid and are past the reminder window`,
        winners
      })

      // The window query only matches for one day, so this fires once rather than daily.
      await sendUnpaidWinnersAlert({ winners, auctionTitle: agedOut[0].auction.title })
    }

    if (unpaidWinners.length === 0) {
      await createLog('info', '[CRON] winner-payment-reminder', {
        cronName: 'winner-payment-reminder',
        status: 'skipped',
        durationMs: Date.now() - start,
        detail: 'No unpaid winners due a reminder'
      })
      return NextResponse.json({ success: true, reminded: 0 })
    }

    const sent: string[] = []
    const failed: { email: string; error: string }[] = []

    for (const winner of unpaidWinners) {
      // One bad address must not stop the rest of the list. The count is only incremented on a
      // send that worked, so a failure is retried tomorrow rather than burning an attempt.
      try {
        await sendWinnerEmail({
          email: winner.user.email,
          firstName: winner.user.firstName ?? 'Friend',
          auctionId: winner.auctionId,
          winningBidderId: winner.id,
          items: winner.auctionItems.map((item) => ({ name: item.name, soldPrice: Number(item.soldPrice) })),
          itemsTotal: Number(winner.itemsTotal ?? 0),
          shipping: Number(winner.shipping ?? 0),
          totalPrice: Number(winner.totalPrice ?? 0),
          reminderNumber: winner.emailNotificationCount + 1
        })

        await prisma.auctionWinningBidder.update({
          where: { id: winner.id },
          data: {
            emailNotificationCount: { increment: 1 },
            auctionPaymentNotificationEmailHasBeenSent: true
          }
        })

        sent.push(winner.user.email)
      } catch (error) {
        failed.push({ email: winner.user.email, error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }

    await createLog(failed.length ? 'error' : 'info', '[CRON] winner-payment-reminder', {
      cronName: 'winner-payment-reminder',
      status: failed.length ? 'error' : 'success',
      durationMs: Date.now() - start,
      detail: `${sent.length} reminder(s) sent, ${failed.length} failed`,
      sent,
      ...(failed.length ? { failed } : {})
    })

    return NextResponse.json({ success: true, reminded: sent.length, failed: failed.length })
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
