'use server'

import { stripeClient } from 'lib/stripe/stripe-client'
import prisma from 'prisma/client'
import { createLog } from '../log/createLog'
import { requireAuth } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import { stampUserGeoFromRequest } from '../_infra/stampUserGeoFromRequest'

export const updateSubscriptionPaymentMethod = async ({
  subscriptionId,
  paymentMethodId
}: {
  subscriptionId: string
  paymentMethodId: string
}) => {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  try {
    const [subscription, details] = await Promise.all([
      stripeClient.subscriptions.retrieve(subscriptionId),
      stampUserGeoFromRequest(gate.userId)
    ])

    const customerId = subscription.customer as string

    await Promise.all([
      stripeClient.paymentMethods.attach(paymentMethodId, { customer: customerId })
    ])

    await Promise.all([
      stripeClient.subscriptions.update(subscriptionId, {
        default_payment_method: paymentMethodId
      }),
      stripeClient.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId }
      }),
      prisma.order.updateMany({
        where: { stripeSubscriptionId: subscriptionId, userId: gate.userId },
        data: { paymentMethodId }
      })
    ])

    await createLog('info', 'Subscription payment method updated', {
      subscriptionId,
      userId: gate.userId,
      ip: details?.ip,
      device: details?.device,
      city: details?.geoCity,
      country: details?.geoCountry
    })

    return { success: true, error: null }
  } catch (error) {
    await createLog('error', 'Failed to update subscription payment method', {
      error: getErrorMessage(error),
      subscriptionId,
      userId: gate.userId
    })

    return {
      success: false,
      error: getErrorMessage(error)
    }
  }
}
