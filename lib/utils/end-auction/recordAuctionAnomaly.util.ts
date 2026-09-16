import prisma from 'prisma/client'
import { createLog } from 'lib/actions/log/createLog'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'
import { resend } from 'lib/email/resend'
import { auctionAnomalyTemplate } from 'lib/email/templates/auction-anomaly.template'

/**
 * Things that should not be possible. Both of these have a billing consequence if they ever
 * happen, so they are recorded, pushed to the super feed, and emailed rather than left in a log
 * nobody reads at 6pm.
 */
export const ANOMALY_TYPES = {
  DUPLICATE_TOP_BID: {
    title: 'Two top bids on one item',
    what: 'More than one bid is marked as the top bid on the same item, which would bill two people for one thing. The auction has not been resolved and will try again at the top of the next hour.',
    fix: 'Look at the bids on that item, leave the highest as TOP_BID and set the others to OUTBID. The next run will then resolve normally.'
  },
  WINNER_RESOLUTION_FAILED: {
    title: 'Winners could not be worked out',
    what: 'The auction has ended but no winners were resolved, so nothing has been charged and no payment requests have gone out. It will try again at the top of the next hour, but it will hit the same problem unless something changes.',
    fix: 'Read the message below, fix the cause, and the next run picks up where it left off. Nothing needs undoing first.'
  }
} as const

export type AnomalyType = keyof typeof ANOMALY_TYPES

export async function recordAuctionAnomaly({
  auctionId,
  auctionTitle,
  type,
  message,
  itemId = '',
  itemName = '',
  metadata
}: {
  auctionId: string
  auctionTitle: string
  type: AnomalyType
  message: string
  itemId?: string
  itemName?: string
  metadata?: Record<string, unknown>
}) {
  // Recording comes first and on its own: the anomaly is the record, and an email or a socket
  // failing should not lose it.
  try {
    await prisma.auctionAnomaly.create({
      data: { auctionId, type, itemId, itemName, message, metadata: metadata as never }
    })
  } catch (error) {
    await createLog('error', 'Failed to record auction anomaly', {
      auctionId,
      type,
      message,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  await createLog('error', `[ANOMALY] ${type}`, { auctionId, auctionTitle, itemId, itemName, message, ...metadata })

  try {
    await pusherSuperuser('auction-anomaly', { auctionId, auctionTitle, type, itemId, itemName, message })
  } catch {
    // The super feed only matters if someone is watching it, and the email covers when nobody is.
  }

  try {
    await resend.emails.send({
      from: `Little Paws Dachshund Rescue <${process.env.RESEND_FROM_EMAIL!}>`,
      to: process.env.ALERT_EMAIL!,
      subject: `${ANOMALY_TYPES[type].title}: ${auctionTitle}`,
      html: auctionAnomalyTemplate({ auctionId, auctionTitle, type, itemName, message })
    })
  } catch (error) {
    await createLog('error', 'Failed to email auction anomaly', {
      auctionId,
      type,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
