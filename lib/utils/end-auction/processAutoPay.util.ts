import sendConfirmationEmail from 'lib/email/sendConfirmationEmail'
import { stripeClient } from 'lib/stripe/stripe-client'
import prisma from 'prisma/client'
import { resolveAuctionWinners } from './resolveAuctionWinners.util'
import { createLog } from 'lib/actions/log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { calculateStripeFees } from '../fees.utils'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'

type Winner = Awaited<ReturnType<typeof resolveAuctionWinners>>[number]

type WinnerAddress = {
  addressLine1: string
  addressLine2: string | null
  city: string
  state: string
  zipPostalCode: string
}

type AutoPayOutcome = 'charged' | 'payment-link' | 'needs-attention'

// One event per winner at close, so the super feed shows every result as it happens
const notifyFeed = (winner: Winner, outcome: AutoPayOutcome, details: Record<string, unknown> = {}) =>
  pusherSuperuser('auto-pay', {
    outcome,
    winningBidderId: winner.winningBidderId,
    name: [winner.user.firstName, winner.user.lastName].filter(Boolean).join(' ') || winner.user.email,
    total: winner.totalPrice,
    ...details
  }).catch(() => {})

async function getWinnerUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      autoPay: true,
      autoPayCoverFees: true,
      email: true,
      firstName: true,
      lastName: true,
      stripeCustomerId: true,
      lastGeoLatitude: true,
      lastGeoLongitude: true,
      lastGeoCity: true,
      lastGeoRegion: true,
      lastGeoCountry: true
    }
  })
}

async function getDefaultPaymentMethod(userId: string) {
  return prisma.paymentMethod.findFirst({ where: { userId, isDefault: true } })
}

/**
 * Marks a winner settled and moves the auction's revenue with it, in one transaction.
 * The winner row is read first because the increment needs its auctionId and totalPrice.
 */
async function markWinnerPaid(winningBidderId: string): Promise<void> {
  const winner = await prisma.auctionWinningBidder.findUniqueOrThrow({
    where: { id: winningBidderId },
    select: { auctionId: true, totalPrice: true, winningBidPaymentStatus: true }
  })

  if (winner.winningBidPaymentStatus === 'PAID') return

  await prisma.$transaction([
    prisma.auctionWinningBidder.update({
      where: { id: winningBidderId },
      data: {
        winningBidPaymentStatus: 'PAID',
        auctionItemPaymentStatus: 'PAID',
        paidOn: new Date(),
        shippingStatus: 'PENDING_FULFILLMENT'
      }
    }),
    prisma.auction.update({
      where: { id: winner.auctionId },
      data: { totalAuctionRevenue: { increment: winner.totalPrice ?? 0 } }
    })
  ])
}

async function createAuctionOrder({
  winner,
  user,
  address,
  paymentIntentId,
  paymentMethodId,
  totalAmount,
  coverFees,
  feesCovered
}: {
  winner: Winner
  user: NonNullable<Awaited<ReturnType<typeof getWinnerUser>>>
  address: WinnerAddress
  paymentIntentId: string
  paymentMethodId: string
  totalAmount: number
  coverFees: boolean
  feesCovered: number
}) {
  const customerName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
  const hasPhysical = winner.items.some((i) => i.requiresShipping)

  // Items are nested rather than created in a second call. The money has already moved by the time
  // this runs, so a failure between the two writes would leave a confirmed order with nothing in
  // it and no record of what was bought. Nesting also returns the items, so no re-fetch.
  return prisma.order.create({
    data: {
      type: 'AUCTION_PURCHASE',
      status: 'CONFIRMED',
      subtotal: winner.itemsTotal,
      shipping: winner.shipping,
      totalAmount,
      paymentIntentId,
      paymentMethodId,
      customerEmail: user.email ?? '',
      customerName,
      userId: winner.userId,
      paidAt: new Date(),
      coverFees,
      feesCovered,
      isPhysical: hasPhysical,
      shippingStatus: hasPhysical ? 'PENDING_FULFILLMENT' : null,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      zipPostalCode: address.zipPostalCode,
      // Little Paws ships domestically only, so this is a constant rather than a field on address.
      country: 'US',
      geoLatitude: user.lastGeoLatitude,
      geoLongitude: user.lastGeoLongitude,
      geoCity: user.lastGeoCity,
      geoRegion: user.lastGeoRegion,
      geoCountry: user.lastGeoCountry,
      geoSource: user.lastGeoLatitude != null ? 'ip' : null,
      autoPaid: true,
      items: {
        create: winner.items.map((item) => ({
          itemType: 'AUCTION_WINNING_BID' as const,
          itemName: item.name,
          price: item.soldPrice,
          quantity: 1,
          subtotal: item.soldPrice,
          shippingPrice: item.shipping,
          totalPrice: item.soldPrice + item.shipping,
          isPhysical: item.requiresShipping
        }))
      }
    },
    include: { items: true }
  })
}

/**
 * Charges a winner's saved card when they have auto-pay on. Every path that cannot charge falls back
 * to emailing them a payment link, so nobody is left without a way to pay. Once the card is charged,
 * nothing falls back to that email: a problem recording the win is logged for follow-up instead,
 * because asking a charged winner to pay again could charge them twice.
 */
export async function processAutoPay(winner: Winner, auction: { id: string; title: string }, sendPaymentRequestEmail: () => Promise<void>) {
  const user = await getWinnerUser(winner.userId)
  if (!user?.autoPay) {
    await notifyFeed(winner, 'payment-link', { reason: 'Auto-pay off' })
    return sendPaymentRequestEmail()
  }

  const [paymentMethod, address] = await Promise.all([
    getDefaultPaymentMethod(winner.userId),
    prisma.address.findUnique({ where: { userId: winner.userId } })
  ])

  if (!paymentMethod?.stripePaymentId || !user.stripeCustomerId) {
    await createLog('warn', '[AUTO-PAY] skipped — no saved card', {
      userId: winner.userId,
      winningBidderId: winner.winningBidderId
    })
    await notifyFeed(winner, 'payment-link', { reason: 'No saved card' })
    return sendPaymentRequestEmail()
  }

  if (!address?.addressLine1 || !address.city || !address.state || !address.zipPostalCode) {
    await createLog('warn', '[AUTO-PAY] skipped — missing address', {
      userId: winner.userId,
      winningBidderId: winner.winningBidderId
    })
    await notifyFeed(winner, 'payment-link', { reason: 'Missing address' })
    return sendPaymentRequestEmail()
  }

  const processingFee = user.autoPayCoverFees ? calculateStripeFees(winner.totalPrice) : 0
  const finalAmount = Math.round((winner.totalPrice + processingFee) * 100) / 100
  const customerName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()

  let paymentIntent: Awaited<ReturnType<typeof stripeClient.paymentIntents.create>>

  try {
    paymentIntent = await stripeClient.paymentIntents.create(
      {
        amount: Math.round(finalAmount * 100),
        currency: 'usd',
        customer: user.stripeCustomerId,
        payment_method: paymentMethod.stripePaymentId,
        confirm: true,
        off_session: true,
        description: `Auto-pay: ${auction.title}`,
        receipt_email: user.email ?? '',
        metadata: {
          orderType: 'AUCTION_PURCHASE',
          userId: winner.userId,
          name: customerName,
          email: user.email ?? '',
          winningBidderId: winner.winningBidderId,
          auctionId: auction.id,
          coverFees: user.autoPayCoverFees ? 'true' : 'false',
          feesCovered: processingFee.toString(),
          saveCard: 'false'
        }
      },
      // A retry of the cron must not charge the same win twice
      { idempotencyKey: `autopay-${winner.winningBidderId}` }
    )
  } catch (error) {
    // Declined, expired, needs authentication: nothing was charged, so the payment link is the right fallback
    await createLog('error', '[AUTO-PAY] charge failed', {
      userId: winner.userId,
      winningBidderId: winner.winningBidderId,
      error: getErrorMessage(error)
    })
    await notifyFeed(winner, 'payment-link', { reason: `Declined: ${getErrorMessage(error)}` })
    return sendPaymentRequestEmail()
  }

  if (paymentIntent.status !== 'succeeded') {
    await createLog('warn', '[AUTO-PAY] intent did not succeed', {
      userId: winner.userId,
      winningBidderId: winner.winningBidderId,
      status: paymentIntent.status
    })
    await notifyFeed(winner, 'payment-link', { reason: `Payment ${paymentIntent.status}` })
    return sendPaymentRequestEmail()
  }

  // The card has been charged. From here nothing may ask the winner to pay again: a failure is logged
  // for follow-up, and the webhook for this payment records the win if this code didn't get to it
  try {
    // The webhook for this payment can occasionally get here first and record the win itself
    const recorded = await prisma.order.findFirst({ where: { paymentIntentId: paymentIntent.id }, select: { id: true } })
    if (recorded) {
      await createLog('info', '[AUTO-PAY] success, recorded by the webhook', {
        winningBidderId: winner.winningBidderId,
        orderId: recorded.id,
        paymentIntentId: paymentIntent.id
      })
      await notifyFeed(winner, 'charged', { amount: finalAmount, via: 'webhook' })
      return
    }

    await markWinnerPaid(winner.winningBidderId)

    const order = await createAuctionOrder({
      winner,
      user,
      address: {
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        zipPostalCode: address.zipPostalCode
      },
      paymentIntentId: paymentIntent.id,
      paymentMethodId: paymentMethod.stripePaymentId,
      totalAmount: finalAmount,
      coverFees: user.autoPayCoverFees,
      feesCovered: processingFee
    })

    await sendConfirmationEmail(order).catch((error) =>
      createLog('error', '[AUTO-PAY] charged, but the receipt email failed', {
        winningBidderId: winner.winningBidderId,
        orderId: order.id,
        error: getErrorMessage(error)
      })
    )

    await createLog('info', '[AUTO-PAY] success', {
      userId: winner.userId,
      winningBidderId: winner.winningBidderId,
      amount: finalAmount,
      paymentIntentId: paymentIntent.id
    })
    await notifyFeed(winner, 'charged', { amount: finalAmount, coverFees: user.autoPayCoverFees })
  } catch (error) {
    await createLog('error', '[AUTO-PAY] charged, but recording the win failed. Check this winner by hand', {
      userId: winner.userId,
      winningBidderId: winner.winningBidderId,
      amount: finalAmount,
      paymentIntentId: paymentIntent.id,
      error: getErrorMessage(error)
    })
    await notifyFeed(winner, 'needs-attention', {
      amount: finalAmount,
      paymentIntentId: paymentIntent.id,
      error: getErrorMessage(error)
    })
  }
}
