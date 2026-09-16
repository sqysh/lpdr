import { createLog } from 'lib/actions/log/createLog'
import { resend } from 'lib/email/resend'
import { resolverFailureTemplate } from 'lib/email/templates/resolver-failure.template'

/**
 * An auction ends at one specific moment and the resolver runs once when it does. If it throws,
 * the auction sits ENDED with no winners, retries hourly against the same state, and nobody
 * hears anything: no winner emails, no charges, no sign on the admin page that something is
 * wrong.
 *
 * Sending on failure rather than logging it is the point. Nobody is watching the logs at 6pm.
 */
export async function sendResolverAlert({ auctionId, auctionTitle, error }: { auctionId: string; auctionTitle: string; error: unknown }) {
  const message = error instanceof Error ? error.message : 'Unknown error'

  try {
    await resend.emails.send({
      from: `Little Paws Dachshund Rescue <${process.env.RESEND_FROM_EMAIL!}>`,
      to: process.env.ALERT_EMAIL!,
      subject: `Auction did not resolve: ${auctionTitle}`,
      html: resolverFailureTemplate({ auctionId, auctionTitle, message })
    })
  } catch (sendError) {
    // Nothing left to escalate to, so the log is the last resort.
    await createLog('error', 'Failed to send resolver alert', {
      auctionId,
      originalError: message,
      error: sendError instanceof Error ? sendError.message : 'Unknown error'
    })
  }
}
