import { z } from 'zod'
import { EMPTY_SPAM_GUARD, spamGuardFields } from './spam-guard.schema'

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.email('Please enter a valid email address').trim().toLowerCase(),
  subject: z.string().trim().min(1, 'Subject is required').max(150),
  message: z.string().trim().min(1, 'Message is required').max(5000),
  ...spamGuardFields
})

export type ContactFormInput = z.input<typeof contactSchema>
export type ContactFormValues = z.output<typeof contactSchema>

export const EMPTY_CONTACT: ContactFormInput = {
  name: '',
  email: '',
  subject: '',
  message: '',
  ...EMPTY_SPAM_GUARD
}
