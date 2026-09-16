'use server'

import Stripe from 'stripe'
import prisma from 'prisma/client'
import { createLog } from '../log/createLog'
import { stripeClient } from '../../stripe/stripe-client'
import { ProductSizeEntry } from 'types/product'
import { WelcomeWienerProduct } from 'types/welcome-wiener'
import { validateSavedCard } from './validateSavedCard'
import { getOrCreateStripeCustomer } from './getOrCreateCustomer'
import { requireAuth } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import { grossUpCents } from 'lib/utils/fees.utils'
import { parseInput } from 'lib/utils/validate.utils'
import { createPaymentIntentSchema } from 'lib/schemas/payment.schema'
import { stampUserGeoFromRequest } from '../_infra/stampUserGeoFromRequest'
import type { ActionResult } from 'types/action.types'
import { OrderType } from '@prisma/client'
import { ADOPTION_FEE_CENTS, MIN_DONATION_CENTS } from 'lib/constants/adoption-fees.constants'
import { hasActiveAdoptionFee } from '../adoption-fee/hasActiveAdoptionFee'

const RATE_LIMIT_MAX_ATTEMPTS = 5
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000

type PaymentIntentData = {
  clientSecret: string | null
  paymentIntentId: string
}

const fail = (error: string): ActionResult<PaymentIntentData> => ({
  success: false,
  data: null,
  error
})

export async function createPaymentIntent(input: unknown): Promise<ActionResult<PaymentIntentData>> {
  const gate = await requireAuth()
  if (gate.ok === false) return fail(gate.error)

  const parsed = parseInput(createPaymentIntentSchema, input)
  if (parsed.ok === false) return parsed.result

  const { amount, orderType, saveCard, coverFees, savedCardId, items, winningBidderId, auctionItemId } = parsed.data

  const userId = gate.userId

  let existingWinnerIntentId: string | null = null

  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS)
  const recentAttempts = await prisma.paymentAttempt.count({
    where: { userId, createdAt: { gt: windowStart } }
  })

  if (recentAttempts >= RATE_LIMIT_MAX_ATTEMPTS) {
    await createLog('warn', 'Payment intent rate limit exceeded', {
      userId,
      orderType,
      recentAttempts
    })
    return fail('Too many payment attempts. Please try again in a few minutes.')
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true }
    })

    if (!user?.email) return fail('Your account is missing an email address.')

    const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    const verifiedEmail = user.email

    let baseCents = 0
    let shippingCents = 0
    let purchaseDescription = `Order from ${displayName}`

    if (items?.length) {
      const ids = items.map((i) => i.id).filter((id): id is string => !!id)
      const wienerIds = items.map((i) => i.welcomeWienerId).filter((id): id is string => !!id)

      const [products, wieners] = await Promise.all([
        ids.length ? prisma.product.findMany({ where: { id: { in: ids } } }) : Promise.resolve([]),
        wienerIds.length ? prisma.welcomeWiener.findMany({ where: { id: { in: wienerIds } } }) : Promise.resolve([])
      ])

      if (items.length === 1) {
        const product = products.find((p) => p.id === items[0].id)
        purchaseDescription = `${product?.name ?? items[0].name} purchase from ${displayName}`
      } else {
        purchaseDescription = `${items.length}-item order from ${displayName}`
      }

      let itemsBase = 0
      let shippingBase = 0

      for (const item of items) {
        if (item.feedAFosterId) {
          itemsBase += item.price * item.quantity
          continue
        }

        const product = products.find((p) => p.id === item.id)

        if (product) {
          if (!product.isLive) throw new Error(`${product.name} is no longer available`)
          const sizes = product.sizes as ProductSizeEntry[] | null
          const available = item.size ? (sizes?.find((s) => s.size === item.size)?.quantity ?? 0) : product.countInStock
          if (item.quantity > available) {
            throw new Error(`Only ${available} of ${product.name}${item.size ? ` (${item.size})` : ''} available`)
          }
          itemsBase += Number(product.price) * item.quantity
          shippingBase += Number(product.shippingPrice)
          continue
        }

        const wiener = wieners.find((w) => w.id === item.welcomeWienerId)
        if (!wiener) throw new Error(`Item unavailable: ${item.name}`)
        if (!wiener.isLive) throw new Error(`${wiener.name} is no longer accepting donations`)

        const options = wiener.associatedProducts as unknown as WelcomeWienerProduct[]
        const option = options.find((o) => o.id === (item.welcomeWienerProductId ?? item.id))
        if (!option) throw new Error(`Invalid donation option for ${wiener.name}`)

        itemsBase += Number(option.price) * item.quantity
      }

      shippingCents = Math.round(shippingBase * 100)
      baseCents = Math.round(itemsBase * 100) + shippingCents
    } else if (orderType === 'AUCTION_PURCHASE') {
      if (auctionItemId) {
        // Instant buy — a fixed-price item, priced from the database
        const item = await prisma.auctionItem.findFirst({
          where: { id: auctionItemId, auction: { status: 'ACTIVE' } },
          select: {
            name: true,
            status: true,
            sellingFormat: true,
            buyNowPrice: true,
            shippingCosts: true,
            requiresShipping: true
          }
        })

        if (!item) throw new Error('This item is no longer available')
        if (item.sellingFormat !== 'FIXED') throw new Error('This item is not available for instant buy')
        if (item.status === 'SOLD') throw new Error('This item has already been sold')
        if (item.buyNowPrice == null) throw new Error('This item has no price set')

        const shipping = item.requiresShipping ? Number(item.shippingCosts ?? 0) : 0

        shippingCents = Math.round(shipping * 100)
        baseCents = Math.round(Number(item.buyNowPrice) * 100) + shippingCents
        purchaseDescription = `${item.name} instant buy from ${displayName}`
      } else if (winningBidderId) {
        const winner = await prisma.auctionWinningBidder.findUnique({
          where: { id: winningBidderId },
          select: {
            userId: true,
            shipping: true,
            paymentIntentId: true,
            winningBidPaymentStatus: true,
            auctionItems: { select: { soldPrice: true } }
          }
        })

        if (!winner || winner.userId !== userId) {
          await createLog('warn', 'Auction payment attempted for another user', {
            userId,
            winningBidderId
          })
          throw new Error('This auction win is not associated with your account')
        }

        if (winner.winningBidPaymentStatus === 'PAID') {
          throw new Error('This auction item has already been paid for')
        }

        existingWinnerIntentId = winner.paymentIntentId

        const itemsTotal = winner.auctionItems.reduce((sum, i) => sum + Number(i.soldPrice ?? 0), 0)
        if (itemsTotal <= 0) throw new Error('This auction win has no items to pay for')

        shippingCents = Math.round(Number(winner.shipping ?? 0) * 100)
        baseCents = Math.round(itemsTotal * 100) + shippingCents
      } else {
        throw new Error('Missing auction reference')
      }
    } else if (orderType === 'ADOPTION_FEE') {
      // Someone whose confirmation is slow will try again, and without this they pay twice for
      // one week of access. Happened on Sep 15: two charges a minute apart, both confirmed.
      const active = await hasActiveAdoptionFee()

      if (active.isActive) {
        await createLog('warn', 'Adoption fee attempted while one is already active', { userId })
        throw new Error('You already have access to the adoption application.')
      }

      baseCents = ADOPTION_FEE_CENTS
    } else {
      // Donor-chosen amount (one-time and recurring donations)
      baseCents = amount ?? 0
      if (orderType === 'ONE_TIME_DONATION' && baseCents < MIN_DONATION_CENTS) {
        return fail('Minimum donation is $5')
      }
    }

    const finalCents = coverFees ? grossUpCents(baseCents) : baseCents
    const feesCoveredCents = finalCents - baseCents

    await prisma.paymentAttempt.create({ data: { userId } })

    const [details, customerId] = await Promise.all([
      stampUserGeoFromRequest(userId),
      getOrCreateStripeCustomer({ userId, email: verifiedEmail })
    ])

    const descriptions: Record<OrderType, string> = {
      ONE_TIME_DONATION: `One-time donation from ${displayName}`,
      RECURRING_DONATION: `Recurring donation from ${displayName}`,
      ADOPTION_FEE: `Adoption fee from ${displayName}`,
      AUCTION_PURCHASE: auctionItemId ? purchaseDescription : `Auction payment from ${displayName}`,
      PURCHASE: purchaseDescription,
      ECARD: `Ecard purchase from ${displayName}`
    }

    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: finalCents,
      currency: 'usd',
      customer: customerId,
      receipt_email: verifiedEmail,
      description: descriptions[orderType] ?? `Payment from ${displayName}`,
      setup_future_usage: saveCard ? 'on_session' : undefined,
      metadata: {
        orderType,
        userId,
        name: displayName,
        email: verifiedEmail,
        saveCard: saveCard ? 'true' : 'false',
        subtotal: ((baseCents - shippingCents) / 100).toFixed(2),
        shipping: (shippingCents / 100).toFixed(2),
        coverFees: coverFees ? 'true' : 'false',
        feesCovered: (feesCoveredCents / 100).toFixed(2),
        ...(items?.length && {
          items: JSON.stringify(
            items.map((i) => ({
              i: i.id,
              q: i.quantity,
              ...(i.size && { s: i.size })
            }))
          )
        }),
        winningBidderId: winningBidderId ?? '',
        auctionItemId: auctionItemId ?? ''
      }
    }

    if (savedCardId) {
      const paymentMethodId = await validateSavedCard({ savedCardId, userId, customerId })
      paymentIntentParams.payment_method = paymentMethodId
      paymentIntentParams.off_session = true
      paymentIntentParams.confirm = true
    }

    // A winner owes one amount once. Without this, a stuck confirmation screen and an admin or
    // supporter pressing the button again mints a second intent and takes a second payment,
    // which is exactly what happened on Sep 13.
    const REUSABLE_STATUSES = new Set(['requires_payment_method', 'requires_confirmation', 'requires_action'])

    let paymentIntent: Stripe.PaymentIntent | null = null

    if (existingWinnerIntentId) {
      const existing = await stripeClient.paymentIntents.retrieve(existingWinnerIntentId).catch(() => null)

      if (existing?.status === 'succeeded' || existing?.status === 'processing') {
        throw new Error('This auction win has already been paid for')
      }

      if (existing && REUSABLE_STATUSES.has(existing.status)) {
        if (savedCardId) {
          // The saved-card path creates and confirms in one call, so an unconfirmed intent can't
          // be handed to it. Cancelling first keeps one live intent per winner.
          await stripeClient.paymentIntents.cancel(existing.id).catch(() => null)
        } else {
          paymentIntent =
            existing.amount === finalCents
              ? existing
              : await stripeClient.paymentIntents.update(existing.id, {
                  amount: finalCents,
                  metadata: paymentIntentParams.metadata
                })
        }
      }
    }

    const idempotencyKey = winningBidderId
      ? `winner-${winningBidderId}-${finalCents}`
      : orderType === 'ADOPTION_FEE'
        ? `adoption-${userId}-${finalCents}-${new Date().toISOString().slice(0, 10)}`
        : undefined

    if (!paymentIntent) {
      paymentIntent = await stripeClient.paymentIntents.create(paymentIntentParams, idempotencyKey ? { idempotencyKey } : undefined)

      if (winningBidderId) {
        await prisma.auctionWinningBidder.update({
          where: { id: winningBidderId },
          data: { paymentIntentId: paymentIntent.id }
        })
      }
    }

    await createLog('info', 'Payment intent created', {
      orderType,
      userId,
      amount: finalCents,
      ip: details?.ip,
      device: details?.device,
      city: details?.geoCity,
      country: details?.geoCountry
    })

    return {
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    }
  } catch (error) {
    await createLog('error', 'Failed to create payment intent', {
      error: getErrorMessage(error),
      orderType,
      userId
    })

    return fail(getErrorMessage(error))
  }
}
