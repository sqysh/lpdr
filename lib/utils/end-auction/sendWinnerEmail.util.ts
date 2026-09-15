import { createLog } from 'lib/actions/log/createLog'
import { resend } from 'lib/email/resend'
import { auctionWinningBidderTemplate } from 'lib/email/templates/winning-bidder.template'

/** The first notice announces the win. Later ones are chasing payment, and should say so. */
const subjectFor = (reminderNumber: number) => {
  if (reminderNumber === 0) return 'You won items in the Little Paws Auction!'
  if (reminderNumber === 1) return 'A reminder about your Little Paws auction items'
  return 'Your Little Paws auction items are still waiting for payment'
}

export async function sendWinnerEmail({
  email,
  firstName,
  auctionId,
  winningBidderId,
  items,
  itemsTotal,
  shipping,
  totalPrice,
  reminderNumber = 0
}: {
  email: string
  firstName: string
  auctionId: string
  winningBidderId: string
  items: { name: string; soldPrice: number }[]
  itemsTotal: number
  shipping: number
  totalPrice: number
  /** 0 for the notice sent when the auction ends, then 1 upward for each reminder. */
  reminderNumber?: number
}) {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://littlepawsdr.org'
  const url = `${BASE}/auctions/winner/${winningBidderId}`

  try {
    const result = await resend.emails.send({
      from: `Little Paws Dachshund Rescue <${process.env.RESEND_FROM_EMAIL!}>`,
      to: email,
      subject: subjectFor(reminderNumber),
      html: auctionWinningBidderTemplate({ url, firstName, items, itemsTotal, shipping, totalPrice, reminderNumber })
    })

    await createLog('info', 'Winner email sent successfully', {
      location: ['sendWinnerEmail.ts'],
      email,
      auctionId,
      winningBidderId,
      reminderNumber,
      messageId: result.data?.id
    })
  } catch (error) {
    await createLog('error', 'Failed to send winner email', {
      location: ['sendWinnerEmail.ts'],
      email,
      auctionId,
      winningBidderId,
      reminderNumber,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    throw error
  }
}
