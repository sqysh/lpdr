'use server'

import { stripeClient } from '../../stripe/stripe-client'
import { createLog } from '../log/createLog'
import { RecurringFrequency } from '@prisma/client'
import { AuthFailure, requireAuth } from '../auth/requireAuth'
import { getErrorMessage } from 'app/utils/_error.utils'
import { stampUserGeoFromRequest } from '../auth/stampUserGeoFromRequest'

interface CreateSubscriptionParams {
  setupIntentId: string
  name?: string
  email?: string
  frequency: RecurringFrequency
  amount: number
  coverFees?: boolean
  feesCovered?: number
  tierName: string
}

export async function createSubscriptionAfterSetup({
  setupIntentId,
  email,
  name,
  frequency,
  amount,
  coverFees = false,
  feesCovered = 0,
  tierName
}: CreateSubscriptionParams) {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, error: (gate as AuthFailure).error, data: null }

  try {
    const setupIntent = await stripeClient.setupIntents.retrieve(setupIntentId)

    if (setupIntent.status !== 'succeeded') {
      return { success: false, error: 'Card confirmation failed. Please try again.', data: null }
    }

    const customerId = setupIntent.customer as string
    const paymentMethodId = setupIntent.payment_method as string
    const userId = setupIntent.metadata?.userId

    if (!userId) {
      await createLog('error', 'Subscription creation missing userId in setup intent metadata', {
        setupIntentId,
        customerId
      })
      return { success: false, error: 'Something went wrong. Please try again.', data: null }
    }

    const details = await stampUserGeoFromRequest(userId)

    const product = await stripeClient.products.create({
      name: `${frequency === 'MONTHLY' ? 'Monthly' : 'Yearly'} Donation`,
      description: `Recurring donation of $${(amount / 100).toFixed(2)}/${frequency === 'MONTHLY' ? 'month' : 'year'}`,
      metadata: {
        userId,
        donorName: setupIntent.metadata?.name || ''
      }
    })

    const price = await stripeClient.prices.create({
      product: product.id,
      unit_amount: amount,
      currency: 'usd',
      recurring: {
        interval: frequency === 'MONTHLY' ? 'month' : 'year',
        usage_type: 'licensed'
      },
      metadata: { frequency }
    })

    const subscription = await stripeClient.subscriptions.create(
      {
        customer: customerId,
        items: [{ price: price.id }],
        default_payment_method: paymentMethodId,
        payment_settings: {
          save_default_payment_method: 'on_subscription'
        },
        description: `${tierName} donation — ${name || email}`,
        metadata: {
          userId,
          email: email || '',
          name: name || '',
          orderType: 'RECURRING_DONATION',
          frequency,
          coverFees: coverFees ? 'true' : 'false',
          feesCovered: feesCovered.toString(),
          tierName
        }
      },
      { idempotencyKey: `sub_${setupIntentId}` }
    )
    await createLog('info', 'Subscription created', {
      userId,
      subscriptionId: subscription.id,
      frequency,
      amount,
      ip: details.ip,
      device: details.device,
      city: details.geoCity,
      country: details.geoCountry
    })

    return {
      success: true,
      subscriptionId: subscription.id,
      status: subscription.status
    }
  } catch (error) {
    await createLog('error', 'Subscription creation failed', {
      error: getErrorMessage(error),
      name,
      email,
      userId: gate.userId
    })

    return {
      success: false,
      error: getErrorMessage(error)
    }
  }
}
