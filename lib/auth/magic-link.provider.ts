import type { EmailConfig } from 'next-auth/providers/email'
import { resend } from '../email/resend'
import { createLog } from '../actions/log/createLog'
import { magicLinkTemplate } from '../email/templates/magic-link.template'
import { getRequestDetails } from 'lib/utils/log.server.utils'
import { checkSignInRateLimit } from 'lib/utils/checkSignInRateLimit.utils'

/**
 * Mail security scanners issue a GET to every link in an incoming message to
 * check it is safe, and a sign-in link works once, so the scanner spends the
 * token before the person clicks. The email points at a confirmation page
 * instead: loading that page consumes nothing, and only pressing the button on
 * it reaches the callback.
 */
const toConfirmUrl = (callbackUrl: string) => {
  const confirmUrl = new URL('/auth/verify', new URL(callbackUrl).origin)
  confirmUrl.searchParams.set('callback', callbackUrl)

  return confirmUrl.toString()
}

export const magicLinkProvider: EmailConfig = {
  id: 'email',
  name: 'Email',
  type: 'email',
  maxAge: 15 * 60, // 15 mins
  from: process.env.RESEND_FROM_EMAIL!,
  sendVerificationRequest: async ({ identifier: email, url, provider }) => {
    const details = await getRequestDetails()
    const limit = await checkSignInRateLimit({ email, ip: details.ip })

    if (limit.allowed === false) {
      await createLog('warn', 'Sign-in request rate limited', {
        location: ['magic-link.provider.ts'],
        email,
        ip: details.ip,
        reason: limit.reason
      })

      // Returning quietly rather than throwing, so the sender is told nothing
      return
    }

    try {
      const result = await resend.emails.send({
        from: `Little Paws Dachshund Rescue <${provider.from!}>`,
        to: email,
        subject: 'Sign in to Little Paws Dachshund Rescue',
        html: magicLinkTemplate(toConfirmUrl(url))
      })

      // Resend reports a refusal in the result rather than throwing, so without
      // this check a rejected send would be logged as a success
      if (result.error || !result.data?.id) {
        throw new Error(result.error?.message ?? 'Resend returned no message id')
      }

      await createLog('info', 'Magic link sent', {
        location: ['magic-link.provider.ts'],
        email,
        messageId: result.data.id
      })
    } catch (error) {
      await createLog('error', 'Failed to send magic link email', {
        location: ['magic-link.provider.ts'],
        email,
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      throw error
    }
  }
}
