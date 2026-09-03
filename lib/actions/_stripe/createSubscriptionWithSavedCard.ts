'use server'

import prisma from 'prisma/client'
import { stripeClient } from '../../stripe/stripe-client'
import { createLog } from '../log/createLog'
import { requireAuth } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import { grossUpCents } from 'lib/utils/fees.utils'
import { parseInput } from 'lib/utils/validate.utils'
import { stampUserGeoFromRequest } from '../_infra/stampUserGeoFromRequest'
import type { ActionResult } from 'types/_action.types'
import { createSubscriptionSchema } from 'lib/schemas/subscription.schema'
import { SUBSCRIPTION_TIERS } from 'lib/constants/subscriptions.constants'

type SubscriptionData = {
  subscriptionId: string
  status: string
}

const fail = (error: string): ActionResult<SubscriptionData> => ({
  success: false,
  data: null,
  error
})

export async function createSubscriptionWithSavedCard(
  input: unknown
): Promise<ActionResult<SubscriptionData>> {
  const gate = await requireAuth()
  if (gate.ok === false) return fail(gate.error)

  const parsed = parseInput(createSubscriptionSchema, input)
  if (parsed.ok === false) return parsed.result

  const { tierId, frequency, coverFees, savedCardId } = parsed.data
  const { userId } = gate

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true, stripeCustomerId: true }
    })

    if (!user?.email) return fail('Your account is missing an email address.')
    if (!user.stripeCustomerId) return fail('No payment profile found for your account.')

    const tier = SUBSCRIPTION_TIERS.find((t) => t.id === tierId)
    if (!tier) return fail('That membership tier is no longer available.')

    const baseCents = Math.round(tier.price[frequency] * 100)
    const amountCents = coverFees ? grossUpCents(baseCents) : baseCents
    const feesCoveredCents = amountCents - baseCents

    const paymentMethod = await stripeClient.paymentMethods.retrieve(savedCardId)

    if (paymentMethod.customer !== user.stripeCustomerId) {
      await createLog('warn', "Subscription attempted with another user's card", {
        userId,
        savedCardId
      })
      return fail('That payment method is not available on your account.')
    }

    const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    const intervalLabel = frequency === 'MONTHLY' ? 'Monthly' : 'Yearly'
    const intervalWord = frequency === 'MONTHLY' ? 'month' : 'year'

    const details = await stampUserGeoFromRequest(userId)

    const product = await stripeClient.products.create({
      name: `${tier.name} — ${intervalLabel} Donation`,
      description: `Recurring donation of $${(baseCents / 100).toFixed(2)}/${intervalWord} — ${tier.name} tier`,
      metadata: { userId, donorName: displayName }
    })

    const price = await stripeClient.prices.create({
      product: product.id,
      unit_amount: amountCents,
      currency: 'usd',
      recurring: {
        interval: intervalWord,
        usage_type: 'licensed'
      },
      metadata: { frequency }
    })

    const subscription = await stripeClient.subscriptions.create(
      {
        customer: user.stripeCustomerId,
        items: [{ price: price.id }],
        default_payment_method: savedCardId,
        payment_settings: { save_default_payment_method: 'on_subscription' },
        description: `${tier.name} donation — ${displayName}`,
        metadata: {
          userId,
          email: user.email,
          name: displayName,
          frequency,
          orderType: 'RECURRING_DONATION',
          coverFees: coverFees ? 'true' : 'false',
          feesCovered: (feesCoveredCents / 100).toFixed(2),
          tierName: tier.name
        }
      },
      { idempotencyKey: `sub_${userId}_${tier.name}_${frequency}` }
    )

    await createLog('info', 'Subscription created with saved card', {
      userId,
      subscriptionId: subscription.id,
      frequency,
      amount: amountCents,
      ip: details?.ip,
      device: details?.device,
      city: details?.geoCity,
      country: details?.geoCountry
    })

    return {
      success: true,
      data: { subscriptionId: subscription.id, status: subscription.status }
    }
  } catch (error) {
    await createLog('error', 'Subscription creation with saved card failed', {
      error: getErrorMessage(error),
      userId
    })

    return fail('Could not start your subscription. Please try again.')
  }
}
