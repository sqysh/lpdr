import { z } from 'zod'
import { EMPTY_SPAM_GUARD, spamGuardFields } from './spam-guard.schema'

export const newsletterSchema = z.object({
  email: z.email('Please enter a valid email address').trim().toLowerCase(),
  ...spamGuardFields
})

export type NewsletterFormInput = z.input<typeof newsletterSchema>
export type NewsletterFormValues = z.output<typeof newsletterSchema>

export const EMPTY_NEWSLETTER: NewsletterFormInput = { email: '', ...EMPTY_SPAM_GUARD }
