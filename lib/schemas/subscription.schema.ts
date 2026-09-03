import { z } from 'zod'
import { RecurringFrequency } from '@prisma/client'

/**
 * Subscribing takes one of two paths, and the client never sends an amount
 * either way. It picks a tier and a frequency; the server looks up what that
 * costs in SUBSCRIPTION_TIERS.
 *
 *   Saved card  →  createSubscriptionWithSavedCard              (one step)
 *   New card    →  createSetupIntentForSubscription             (step 1)
 *                  confirmCardSetup (Stripe.js, client-side)
 *                  createSubscriptionAfterSetup                 (step 2)
 */

/**
 * Saved-card path. `savedCardId` is verified against the caller's
 * stripeCustomerId before anything is charged.
 */
export const createSubscriptionSchema = z.object({
  tierId: z.string().min(1),
  frequency: z.enum(RecurringFrequency),
  coverFees: z.boolean().default(false),
  savedCardId: z.string().min(1)
})

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>

/**
 * New-card path, step 1. Same fields as above minus the card, since there
 * isn't one yet. The action writes tierId, frequency, coverFees and the
 * computed amount into the setup intent's metadata, which makes the intent
 * a server-signed record of what was agreed.
 */
export const createSetupIntentForSubscriptionSchema = createSubscriptionSchema.omit({
  savedCardId: true
})

export type CreateSetupIntentForSubscriptionInput = z.infer<typeof createSetupIntentForSubscriptionSchema>

/**
 * New-card path, step 2. Deliberately only the intent id: the tier, frequency,
 * amount and fee decision are all read back from the metadata written in
 * step 1, so a client can't change the terms between the two calls.
 */
export const createSubscriptionAfterSetupSchema = z.object({
  setupIntentId: z.string().min(1)
})

export type CreateSubscriptionAfterSetupInput = z.infer<typeof createSubscriptionAfterSetupSchema>
