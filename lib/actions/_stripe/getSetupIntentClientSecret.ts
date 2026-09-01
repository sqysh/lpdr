'use server'

import { stripeClient } from 'lib/stripe/stripe-client'
import { createLog } from '../log/createLog'
import { requireAuth } from 'lib/auth/guards'
import { getOrCreateStripeCustomer } from './getOrCreateCustomer'
import { getErrorMessage } from 'app/utils/_error.utils'

export async function getSetupIntentClientSecret() {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  try {
    const customerId = await getOrCreateStripeCustomer({
      userId: gate.userId,
      email: gate.email!
    })

    const setupIntent = await stripeClient.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card']
    })

    return { success: true, clientSecret: setupIntent.client_secret }
  } catch (error) {
    await createLog('error', 'Failed to create setup intent', {
      userId: gate.userId,
      error: getErrorMessage(error)
    })

    return { success: false, error: getErrorMessage(error) }
  }
}
