'use server'

import prisma from 'prisma/client'
import { stripeClient } from '../../stripe/stripe-client'
import { createLog } from '../log/createLog'
import { requireAuth } from 'lib/auth/guards'
import { stampUserGeoFromRequest } from '../_infra/stampUserGeoFromRequest'
import { getErrorMessage } from 'lib/utils/error.utils'
import type { ActionResult } from 'types/action.types'

export const cancelSubscription = async ({ subscriptionId }: { subscriptionId: string }): Promise<ActionResult<null>> => {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  const { userId } = gate

  try {
    const order = await prisma.order.findFirst({
      where: { stripeSubscriptionId: subscriptionId, userId },
      select: { id: true }
    })

    if (!order) return { success: false, data: null, error: 'Subscription not found.' }

    const [details] = await Promise.all([
      stampUserGeoFromRequest(userId),
      stripeClient.subscriptions.update(subscriptionId, { cancel_at_period_end: true })
    ])

    await createLog('info', 'Subscription cancelled at period end', {
      subscriptionId,
      userId,
      ip: details?.ip,
      device: details?.device,
      city: details?.geoCity,
      country: details?.geoCountry
    })

    return { success: true, data: null }
  } catch (error) {
    await createLog('error', 'Failed to cancel subscription', {
      error: getErrorMessage(error),
      subscriptionId,
      userId
    })

    return { success: false, data: null, error: 'Could not cancel your subscription. Please try again.' }
  }
}
