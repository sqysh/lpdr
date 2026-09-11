'use server'

import { contactEmailTemplate } from './templates/contact-email.template'
import { resend } from 'lib/email/resend'
import { createLog } from 'lib/actions/log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { parseInput } from 'lib/utils/validate.utils'
import { contactSchema } from 'lib/schemas/contact.schema'
import { looksAutomated } from 'lib/utils/looksAutomated.utils'
import { ActionResult } from 'types/action.types'

export default async function sendContactEmail(input: unknown): Promise<ActionResult<null>> {
  const parsed = parseInput(contactSchema, input)
  if (parsed.ok === false) return parsed.result

  const { name, email, subject, message, website, renderedAt } = parsed.data

  const reason = looksAutomated({ website, renderedAt })

  if (reason) {
    await createLog('info', 'Automated contact submission ignored', {
      location: ['sendContactEmail.ts'],
      reason,
      email,
      subject
    })

    // Success shape, so the bot learns nothing and keeps posting into the void
    return { success: true, data: null }
  }

  try {
    const result = await resend.emails.send({
      from: 'Little Paws Dachshund Rescue <lpdr@littlepawsdr.org>',
      to: 'lpdr@littlepawsdr.org',
      replyTo: email,
      subject: `[Contact] ${subject}`,
      html: contactEmailTemplate({ name, email, subject, message })
    })

    // Resend reports a refusal in the result rather than throwing
    if (result.error || !result.data?.id) {
      throw new Error(result.error?.message ?? 'Resend returned no message id')
    }

    await createLog('info', 'Contact email sent', {
      location: ['sendContactEmail.ts'],
      name,
      email,
      subject,
      messageId: result.data.id
    })

    return { success: true, data: null }
  } catch (error) {
    await createLog('error', 'Failed to send contact email', {
      location: ['sendContactEmail.ts'],
      name,
      email,
      subject,
      error: getErrorMessage(error)
    })

    return { success: false, error: 'Something went wrong. Please try again.', data: null }
  }
}
