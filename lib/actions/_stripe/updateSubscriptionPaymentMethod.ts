'use server'

import { stripeClient } from 'lib/stripe/stripe-client'
import prisma from 'prisma/client'
import { createLog } from '../log/createLog'
import { requireAuth } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import { stampUserGeoFromRequest } from '../_infra/stampUserGeoFromRequest'
import type { ActionResult } from 'types/action.types'

export const updateSubscriptionPaymentMethod = async ({
  subscriptionId,
  paymentMethodId
}: {
  subscriptionId: string
  paymentMethodId: string
}): Promise<ActionResult<null>> => {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  const { userId } = gate

  try {
    // The subscription must be one of ours, and the customer must be this user's
    const [order, user] = await Promise.all([
      prisma.order.findFirst({
        where: { stripeSubscriptionId: subscriptionId, userId },
        select: { id: true }
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { stripeCustomerId: true }
      })
    ])

    if (!order) return { success: false, data: null, error: 'Subscription not found.' }
    if (!user?.stripeCustomerId) {
      return { success: false, data: null, error: 'No payment profile found for your account.' }
    }

    const [subscription, details] = await Promise.all([
      stripeClient.subscriptions.retrieve(subscriptionId),
      stampUserGeoFromRequest(userId)
    ])

    const customerId = subscription.customer as string

    if (customerId !== user.stripeCustomerId) {
      await createLog('warn', 'Subscription customer mismatch', {
        subscriptionId,
        userId
      })
      return { success: false, data: null, error: 'Subscription not found.' }
    }

    await stripeClient.paymentMethods.attach(paymentMethodId, { customer: customerId })

    await Promise.all([
      stripeClient.subscriptions.update(subscriptionId, {
        default_payment_method: paymentMethodId
      }),
      stripeClient.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId }
      }),
      prisma.order.updateMany({
        where: { stripeSubscriptionId: subscriptionId, userId },
        data: { paymentMethodId }
      })
    ])

    await createLog('info', 'Subscription payment method updated', {
      subscriptionId,
      userId,
      ip: details?.ip,
      device: details?.device,
      city: details?.geoCity,
      country: details?.geoCountry
    })

    return { success: true, data: null }
  } catch (error) {
    await createLog('error', 'Failed to update subscription payment method', {
      error: getErrorMessage(error),
      subscriptionId,
      userId
    })

    return {
      success: false,
      data: null,
      error: 'Could not update your payment method. Please try again.'
    }
  }
}
