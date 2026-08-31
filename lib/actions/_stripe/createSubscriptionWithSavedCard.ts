'use server'

import { RecurringFrequency } from '@prisma/client'
import { stripeClient } from '../../stripe/stripe-client'
import { createLog } from '../log/createLog'
import { AuthFailure, requireAuth } from '../auth/requireAuth'
import { getErrorMessage } from 'app/utils/_error.utils'
import { stampUserGeoFromRequest } from '../auth/stampUserGeoFromRequest'

interface CreateSubscriptionWithSavedCardParams {
  userId: string
  email: string
  name: string
  amount: number
  frequency: RecurringFrequency
  coverFees?: boolean
  feesCovered?: number
  savedCardId?: string
  tierName: string
}

export async function createSubscriptionWithSavedCard({
  userId,
  email,
  name,
  amount,
  frequency,
  coverFees,
  feesCovered,
  savedCardId,
  tierName
}: CreateSubscriptionWithSavedCardParams) {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, error: (gate as AuthFailure).error, data: null }

  try {
    const paymentMethod = await stripeClient.paymentMethods.retrieve(savedCardId)

    if (!paymentMethod.customer) {
      return { success: false, error: 'Payment method is not attached to a customer', data: null }
    }

    const customerId = paymentMethod.customer as string

    const details = await stampUserGeoFromRequest(userId)

    const product = await stripeClient.products.create({
      name: tierName
        ? `${tierName} — ${frequency === 'MONTHLY' ? 'Monthly' : 'Yearly'} Donation`
        : `${frequency === 'MONTHLY' ? 'Monthly' : 'Yearly'} Donation`,
      description: `Recurring donation of $${(amount / 100).toFixed(2)}/${frequency === 'MONTHLY' ? 'month' : 'year'}${tierName ? ` — ${tierName} tier` : ''}`,
      metadata: { userId, donorName: name || '' }
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
        default_payment_method: savedCardId,
        payment_settings: { save_default_payment_method: 'on_subscription' },
        description: `${tierName} donation — ${name || email}`,
        metadata: {
          userId,
          email: email || '',
          name: name || '',
          frequency,
          orderType: 'RECURRING_DONATION',
          coverFees: coverFees ? 'true' : 'false',
          feesCovered: feesCovered?.toString() || '0',
          tierName
        }
      },
      { idempotencyKey: `sub_${customerId}_general_${Date.now()}` }
    )

    await createLog('info', 'Subscription created with saved card', {
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
    await createLog('error', 'Subscription creation with saved card failed', {
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
