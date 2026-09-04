'use server'

import { stripeClient } from 'lib/stripe/stripe-client'
import { createLog } from '../log/createLog'
import { requireAuth } from 'lib/auth/guards'
import { getOrCreateStripeCustomer } from './getOrCreateCustomer'
import { getErrorMessage } from 'lib/utils/error.utils'
import type { ActionResult } from 'types/action.types'

export async function getSetupIntentClientSecret(): Promise<ActionResult<{ clientSecret: string }>> {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  try {
    if (!gate.email) {
      return { success: false, data: null, error: 'Your account is missing an email address.' }
    }

    const customerId = await getOrCreateStripeCustomer({
      userId: gate.userId,
      email: gate.email
    })

    const setupIntent = await stripeClient.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card']
    })

    if (!setupIntent.client_secret) {
      return { success: false, data: null, error: 'Could not start card setup. Please try again.' }
    }

    return { success: true, data: { clientSecret: setupIntent.client_secret } }
  } catch (error) {
    await createLog('error', 'Failed to create setup intent', {
      userId: gate.userId,
      error: getErrorMessage(error)
    })

    return { success: false, data: null, error: 'Could not start card setup. Please try again.' }
  }
}
