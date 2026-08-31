'use server'

import { createLog } from '../log/createLog'
import { stripeClient } from '../../stripe/stripe-client'
import { RecurringFrequency } from '@prisma/client'
import { getOrCreateStripeCustomer } from './getOrCreateCustomer'
import { AuthFailure, requireAuth } from '../auth/requireAuth'
import { getErrorMessage } from 'app/utils/_error.utils'

interface SetupIntentParams {
  userId?: string
  email: string
  name: string
  amount: number
  frequency: RecurringFrequency
  coverFees?: boolean
  feesCovered?: number
  tierName: string
}

export async function createSetupIntentForSubscription({
  userId,
  email,
  name,
  amount,
  frequency,
  coverFees = false,
  feesCovered = 0,
  tierName
}: SetupIntentParams) {
  const gate = await requireAuth()
  if (!gate.ok) return { success: false, error: (gate as AuthFailure).error, data: null }

  if (amount < 500) return { success: false, error: 'Minimum donation is $5', data: null }
  if (!userId) return { success: false, error: 'Please sign in to start a subscription.', data: null }

  try {
    const customerId = await getOrCreateStripeCustomer({ userId, email })

    const setupIntent = await stripeClient.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session',
      metadata: {
        userId,
        email,
        name,
        frequency,
        amount: amount.toString(),
        type: 'RECURRING_DONATION',
        coverFees: coverFees ? 'true' : 'false',
        feesCovered: feesCovered.toString(),
        tierName
      }
    })

    return {
      success: true,
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
      customerId
    }
  } catch (error) {
    await createLog('error', 'SetupIntent creation failed', {
      error: getErrorMessage(error),
      userId,
      email
    })

    return {
      success: false,
      error: getErrorMessage(error)
    }
  }
}
