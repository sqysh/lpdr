'use server'

import prisma from 'prisma/client'
import { createLog } from '../log/createLog'
import { stripeClient } from '../../stripe/stripe-client'
import { getOrCreateStripeCustomer } from './getOrCreateCustomer'
import { requireAuth } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import { grossUpCents } from 'lib/utils/fees.utils'
import { parseInput } from 'lib/utils/validate.utils'
import { createSetupIntentForSubscriptionSchema } from 'lib/schemas/subscription.schema'
import type { ActionResult } from 'types/action.types'
import { SUBSCRIPTION_TIERS } from 'lib/constants/subscriptions.constants'

type SetupIntentData = {
  clientSecret: string
  setupIntentId: string
  customerId: string
}

const fail = (error: string): ActionResult<SetupIntentData> => ({
  success: false,
  data: null,
  error
})

export async function createSetupIntentForSubscription(input: unknown): Promise<ActionResult<SetupIntentData>> {
  const gate = await requireAuth()
  if (gate.ok === false) return fail(gate.error)

  const parsed = parseInput(createSetupIntentForSubscriptionSchema, input)
  if (parsed.ok === false) return parsed.result

  const { tierId, frequency, coverFees } = parsed.data
  const { userId } = gate

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true }
    })

    if (!user?.email) return fail('Your account is missing an email address.')

    const tier = SUBSCRIPTION_TIERS.find((t) => t.id === tierId)
    if (!tier) return fail('That membership tier is no longer available.')

    const baseCents = Math.round(tier.price[frequency] * 100)
    const amountCents = coverFees ? grossUpCents(baseCents) : baseCents
    const feesCoveredCents = amountCents - baseCents

    const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email

    const customerId = await getOrCreateStripeCustomer({ userId, email: user.email })

    const setupIntent = await stripeClient.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session',
      metadata: {
        userId,
        email: user.email,
        name: displayName,
        frequency,
        tierId: tier.id,
        tierName: tier.name,
        amount: amountCents.toString(),
        type: 'RECURRING_DONATION',
        coverFees: coverFees ? 'true' : 'false',
        feesCovered: (feesCoveredCents / 100).toFixed(2)
      }
    })

    if (!setupIntent.client_secret) {
      return fail('Could not start card setup. Please try again.')
    }

    return {
      success: true,
      data: {
        clientSecret: setupIntent.client_secret,
        setupIntentId: setupIntent.id,
        customerId
      }
    }
  } catch (error) {
    await createLog('error', 'SetupIntent creation failed', {
      error: getErrorMessage(error),
      userId
    })

    return fail('Could not start card setup. Please try again.')
  }
}
