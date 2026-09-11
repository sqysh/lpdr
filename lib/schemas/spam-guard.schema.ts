import { z } from 'zod'

/**
 * Spread into any public form schema. `website` is hidden from people and
 * filled in by bots; `renderedAt` is stamped when the form mounts, so a
 * submission that arrives instantly was not typed by anyone.
 */
export const spamGuardFields = {
  website: z.string().trim().optional().default(''),
  renderedAt: z.coerce.number().optional().default(0)
}

export const EMPTY_SPAM_GUARD = { website: '', renderedAt: 0 }
