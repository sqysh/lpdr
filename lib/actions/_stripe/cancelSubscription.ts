'use server'

import prisma from 'prisma/client'
import { stripeClient } from '../../stripe/stripe-client'
import { createLog } from '../log/createLog'
import { AuthFailure, requireAuth } from '../auth/requireAuth'
import { stampUserGeoFromRequest } from '../auth/stampUserGeoFromRequest'
import { getErrorMessage } from 'app/utils/_error.utils'

export const cancelSubscription = async ({ subscriptionId }: { subscriptionId: string }) => {
  const gate = await requireAuth()
  if (!gate.ok) return { success: false, error: (gate as AuthFailure).error, data: null }

  try {
    const order = await prisma.order.findFirst({
      where: { stripeSubscriptionId: subscriptionId, userId: gate.userId }
    })

    if (!order) return { success: false, error: 'Subscription not found.' }

    const [details] = await Promise.all([
      stampUserGeoFromRequest(gate.userId),
      stripeClient.subscriptions.update(subscriptionId, { cancel_at_period_end: true })
    ])

    await createLog('info', 'Subscription cancelled at period end', {
      subscriptionId,
      userId: gate.userId,
      ip: details?.ip,
      device: details?.device,
      city: details?.geoCity,
      country: details?.geoCountry
    })

    return { success: true, error: null }
  } catch (error) {
    await createLog('error', 'Failed to cancel subscription', {
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
