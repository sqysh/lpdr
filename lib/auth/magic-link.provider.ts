import type { EmailConfig } from 'next-auth/providers/email'
import { resend } from '../email/resend'
import { createLog } from '../actions/log/createLog'
import { magicLinkTemplate } from '../email/templates/magic-link.template'

export const magicLinkProvider: EmailConfig = {
  id: 'email',
  name: 'Email',
  type: 'email',
  maxAge: 15 * 60,
  from: process.env.RESEND_FROM_EMAIL!,
  sendVerificationRequest: async ({ identifier: email, url }) => {
    const { data, error } = await resend.emails.send({
      from: `Little Paws Dachshund Rescue <${process.env.RESEND_FROM_EMAIL!}>`,
      to: email,
      subject: 'Sign in to Little Paws Dachshund Rescue',
      html: magicLinkTemplate(url)
    })

    if (error) {
      await createLog('error', 'Failed to send magic link email', {
        email,
        error: error.message
      })
      throw new Error(`Failed to send verification email: ${error.message}`)
    }

    await createLog('info', 'Magic link sent', {
      email,
      messageId: data?.id
    })
  }
}
