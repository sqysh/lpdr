import { createLog } from 'lib/actions/log/createLog'
import { resend } from 'lib/email/resend'
import { unpaidWinnersTemplate } from 'lib/email/templates/unpaid-winners.template'

export type AgedOutWinner = { id: string; email: string; owed: number }

/**
 * Winners who never paid and have now passed the reminder window. Nothing chases them after
 * this, so without a nudge they simply stop existing as far as the system is concerned, and the
 * items they won are gone with the money uncollected.
 */
export async function sendUnpaidWinnersAlert({ winners, auctionTitle }: { winners: AgedOutWinner[]; auctionTitle: string }) {
  if (winners.length === 0) return

  try {
    await resend.emails.send({
      from: `Little Paws Dachshund Rescue <${process.env.RESEND_FROM_EMAIL!}>`,
      to: 'auction@littlepawsdr.org',
      subject: `${winners.length} auction winner${winners.length === 1 ? '' : 's'} never paid`,
      html: unpaidWinnersTemplate({ winners, auctionTitle })
    })
  } catch (error) {
    await createLog('error', 'Failed to send unpaid winners alert', {
      count: winners.length,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
