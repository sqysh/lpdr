'use server'

import prisma from 'prisma/client'
import { RecurringFrequency } from '@prisma/client'
import { stripeClient } from '../../stripe/stripe-client'
import { createLog } from '../log/createLog'
import { requireAuth } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import { parseInput } from 'lib/utils/validate.utils'
import { stampUserGeoFromRequest } from '../_infra/stampUserGeoFromRequest'
import { createSubscriptionAfterSetupSchema } from 'lib/schemas/subscription.schema'
import type { ActionResult } from 'types/action.types'
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

export async function createSubscriptionAfterSetup(input: unknown): Promise<ActionResult<SubscriptionData>> {
  const gate = await requireAuth()
  if (gate.ok === false) return fail(gate.error)

  const parsed = parseInput(createSubscriptionAfterSetupSchema, input)
  if (parsed.ok === false) return parsed.result

  const { setupIntentId } = parsed.data
  const { userId } = gate

  try {
    const setupIntent = await stripeClient.setupIntents.retrieve(setupIntentId)

    if (setupIntent.status !== 'succeeded') {
      return fail('Card confirmation failed. Please try again.')
    }

    // The setup intent was created by us with the caller's id baked in.
    // Everything below comes from there, never from the client.
    if (setupIntent.metadata?.userId !== userId) {
      await createLog('warn', 'Setup intent does not belong to this user', {
        setupIntentId,
        userId
      })
      return fail('Something went wrong. Please try again.')
    }

    const customerId = setupIntent.customer as string
    const paymentMethodId = setupIntent.payment_method as string

    if (!customerId || !paymentMethodId) {
      return fail('Card setup is incomplete. Please try again.')
    }

    const tier = SUBSCRIPTION_TIERS.find((t) => t.id === setupIntent.metadata?.tierId)
    if (!tier) return fail('That membership tier is no longer available.')

    const frequency = setupIntent.metadata?.frequency as RecurringFrequency
    const amountCents = Number(setupIntent.metadata?.amount)

    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return fail('Something went wrong. Please try again.')
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true }
    })

    if (!user?.email) return fail('Your account is missing an email address.')

    const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    const intervalLabel = frequency === 'MONTHLY' ? 'Monthly' : 'Yearly'
    const intervalWord = frequency === 'MONTHLY' ? 'month' : 'year'

    const details = await stampUserGeoFromRequest(userId)

    const product = await stripeClient.products.create({
      name: `${tier.name} — ${intervalLabel} Donation`,
      description: `Recurring donation of $${tier.price[frequency].toFixed(2)}/${intervalWord} — ${tier.name} tier`,
      metadata: { userId, donorName: displayName }
    })

    const price = await stripeClient.prices.create({
      product: product.id,
      unit_amount: amountCents,
      currency: 'usd',
      recurring: { interval: intervalWord, usage_type: 'licensed' },
      metadata: { frequency }
    })

    const subscription = await stripeClient.subscriptions.create(
      {
        customer: customerId,
        items: [{ price: price.id }],
        default_payment_method: paymentMethodId,
        payment_settings: { save_default_payment_method: 'on_subscription' },
        description: `${tier.name} donation — ${displayName}`,
        metadata: {
          userId,
          email: user.email,
          name: displayName,
          orderType: 'RECURRING_DONATION',
          frequency,
          coverFees: setupIntent.metadata?.coverFees ?? 'false',
          feesCovered: setupIntent.metadata?.feesCovered ?? '0',
          tierId: tier.id,
          tierName: tier.name
        }
      },
      { idempotencyKey: `sub_${setupIntentId}` }
    )

    await createLog('info', 'Subscription created', {
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
    await createLog('error', 'Subscription creation failed', {
      error: getErrorMessage(error),
      userId
    })

    return fail('Could not start your subscription. Please try again.')
  }
}
