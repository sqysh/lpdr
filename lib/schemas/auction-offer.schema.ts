import { z } from 'zod'
import { contactSchema } from 'lib/schemas/contact.schema'

// Same bot checks as the contact form, so looksAutomated reads them the same way
export const auctionOfferSchema = contactSchema.pick({ website: true, renderedAt: true }).extend({
  name: z.string().trim().min(1, 'Please add your name').max(120),
  email: z.string().trim().email('Please add a valid email'),
  item: z.string().trim().min(2, 'Tell us what the item is').max(200),
  value: z.string().trim().max(60).optional(),
  notes: z.string().trim().max(2000).optional()
})

export type AuctionOfferInput = z.input<typeof auctionOfferSchema>
