'use server'

import Stripe from 'stripe'
import { createLog } from '../log/createLog'
import { stripeClient } from '../../stripe/stripe-client'
import { OrderType } from '@prisma/client'
import prisma from 'prisma/client'
import { ProductSizeEntry } from 'types/_product'
import { WelcomeWienerProduct } from 'types/_welcome-wiener'
import { validateSavedCard } from './validateSavedCard'
import { getOrCreateStripeCustomer } from './getOrCreateCustomer'
import { requireAuth } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import { stampUserGeoFromRequest } from '../_infra/stampUserGeoFromRequest'

type PaymentItem = {
  id?: string
  name: string
  price: number
  quantity: number
  shippingPrice?: number
  isPhysicalProduct: boolean
  size?: string | null
  welcomeWienerId?: string | null
  welcomeWienerProductId?: string | null
  feedAFosterId?: string | null
}

export type CreatePaymentIntentParams = {
  amount: number
  name: string
  email: string
  orderType: OrderType
  saveCard?: boolean
  coverFees?: boolean
  feesCovered?: number
  savedCardId?: string | null
  items?: PaymentItem[]
  winningBidderId?: string
  auctionItemId?: string
}

const RATE_LIMIT_MAX_ATTEMPTS = 5
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000 // 10 minutes

export async function createPaymentIntent({
  amount,
  name,
  email,
  orderType,
  saveCard = false,
  coverFees = false,
  feesCovered = 0,
  savedCardId,
  items,
  winningBidderId,
  auctionItemId
}: CreatePaymentIntentParams) {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  const userId = gate.userId
  const verifiedEmail = gate.email ?? email // fall back to client email only for display purposes, never for identity/auth logic

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
    return {
      success: false,
      error: 'Too many payment attempts. Please try again in a few minutes.'
    }
  }

  await prisma.paymentAttempt.create({ data: { userId } })

  if (orderType === 'ONE_TIME_DONATION' && amount < 500) {
    return { success: false, error: 'Minimum donation is $5' }
  }

  let purchaseDescription = `Order from ${name}`

  try {
    let computedBase = 0

    if (items?.length) {
      const ids = items.map((i) => i.id).filter((id): id is string => !!id)
      const wienerIds = items.map((i) => i.welcomeWienerId).filter(Boolean) as string[]

      const [products, wieners] = await Promise.all([
        ids.length ? prisma.product.findMany({ where: { id: { in: ids } } }) : Promise.resolve([]),
        wienerIds.length
          ? prisma.welcomeWiener.findMany({ where: { id: { in: wienerIds } } })
          : Promise.resolve([])
      ])

      if (items.length === 1) {
        const product = products.find((p) => p.id === items[0].id)
        purchaseDescription = `${product?.name ?? items[0].name} purchase from ${name}`
      } else {
        purchaseDescription = `${items.length}-item order from ${name}`
      }

      for (const item of items) {
        if (item.feedAFosterId) {
          computedBase += item.price * item.quantity
          continue
        }

        const product = products.find((p) => p.id === item.id)

        if (product) {
          if (!product.isLive) throw new Error(`${product.name} is no longer available`)
          const sizes = product.sizes as ProductSizeEntry[] | null
          const available = item.size
            ? (sizes?.find((s) => s.size === item.size)?.quantity ?? 0)
            : product.countInStock
          if (item.quantity > available) {
            throw new Error(
              `Only ${available} of ${product.name}${item.size ? ` (${item.size})` : ''} available`
            )
          }
          computedBase += (Number(product.price) + Number(product.shippingPrice)) * item.quantity
          continue
        }

        const wiener = wieners.find((w) => w.id === item.welcomeWienerId)
        if (!wiener) throw new Error(`Item unavailable: ${item.name}`)
        if (!wiener.isLive) throw new Error(`${wiener.name} is no longer accepting donations`)

        const options = wiener.associatedProducts as unknown as WelcomeWienerProduct[]
        const option = options.find((o) => o.id === (item.welcomeWienerProductId ?? item.id))
        if (!option) throw new Error(`Invalid donation option for ${wiener.name}`)

        computedBase += Number(option.price) * item.quantity
      }
    }

    const finalCents = items?.length
      ? (() => {
          const baseCents = Math.round(computedBase * 100)
          return coverFees ? baseCents + Math.round(feesCovered * 100) : baseCents
        })()
      : amount

    const [details, customerId] = await Promise.all([
      stampUserGeoFromRequest(userId),
      getOrCreateStripeCustomer({ userId, email: verifiedEmail })
    ])

    const descriptions: Record<string, string> = {
      ONE_TIME_DONATION: `One-time donation from ${name}`,
      RECURRING_DONATION: `Recurring donation from ${name}`,
      WELCOME_WIENER: `Welcome Wiener donation from ${name}`,
      PRODUCT: `Product purchase from ${name}`,
      ADOPTION_FEE: `Adoption fee from ${name}`,
      AUCTION_PURCHASE: `Auction payment from ${name}`,
      PURCHASE: purchaseDescription,
      FEED_A_FOSTER: `Feed a Foster donation from ${name}`
    }

    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: finalCents,
      currency: 'usd',
      customer: customerId,
      receipt_email: verifiedEmail,
      description: descriptions[orderType] ?? `Payment from ${name}`,
      setup_future_usage: saveCard ? 'on_session' : undefined,
      metadata: {
        orderType,
        userId: userId ?? '',
        name,
        email: verifiedEmail,
        saveCard: saveCard ? 'true' : 'false',
        coverFees: coverFees ? 'true' : 'false',
        feesCovered: feesCovered.toString(),
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
      const paymentMethodId = await validateSavedCard({ savedCardId, userId: userId!, customerId })
      paymentIntentParams.payment_method = paymentMethodId
      paymentIntentParams.off_session = true
      paymentIntentParams.confirm = true
    }

    const paymentIntent = await stripeClient.paymentIntents.create(paymentIntentParams)

    await createLog('info', 'Payment intent created', {
      orderType,
      userId: userId ?? null,
      amount: finalCents,
      ip: details?.ip,
      device: details?.device,
      city: details?.geoCity,
      country: details?.geoCountry
    })

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    }
  } catch (error) {
    await createLog('error', 'Failed to create payment intent', {
      error: getErrorMessage(error),
      orderType,
      userId: userId ?? null,
      name,
      email: verifiedEmail
    })

    return {
      success: false,
      error: getErrorMessage(error)
    }
  }
}
