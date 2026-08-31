'use server'

import { contactEmailTemplate } from './templates/contact-email.template'
import { resend } from 'lib/email/resend'
import { createLog } from 'lib/actions/log/createLog'
import { getErrorMessage } from 'app/utils/_error.utils'

export default async function sendContactEmail({
  name,
  email,
  subject,
  message
}: {
  name: string
  email: string
  subject: string
  message: string
}) {
  try {
    await resend.emails.send({
      from: 'Little Paws Dachshund Rescue <lpdr@littlepawsdr.org>',
      to: 'lpdr@littlepawsdr.org',
      replyTo: email,
      subject: `[Contact] ${subject}`,
      html: contactEmailTemplate({ name, email, subject, message })
    })

    await createLog('info', 'Contact email sent', { name, email, subject })

    return { success: true }
  } catch (error) {
    await createLog('error', 'Failed to send contact email', {
      name,
      email,
      subject,
      error: getErrorMessage(error)
    })

    return { success: false, error: getErrorMessage(error) }
  }
}
