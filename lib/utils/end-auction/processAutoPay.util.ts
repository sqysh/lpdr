import sendConfirmationEmail from 'lib/email/sendConfirmationEmail'
import { stripeClient } from 'lib/stripe/stripe-client'
import prisma from 'prisma/client'
import { resolveAuctionWinners } from './resolveAuctionWinners.util'
import { createLog } from 'lib/actions/log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { calculateStripeFees } from '../fees.utils'

type Winner = Awaited<ReturnType<typeof resolveAuctionWinners>>[number]

type WinnerAddress = {
  addressLine1: string
  addressLine2: string | null
  city: string
  state: string
  zipPostalCode: string
}

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
      data: { totalAuctionRevenue: { increment: winner.totalPrice } }
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
 * Charges a winner's saved card when they have auto-pay on. Every path that
 * cannot charge falls back to emailing them a payment link, so nobody is left
 * without a way to pay.
 */
export async function processAutoPay(winner: Winner, auction: { id: string; title: string }, sendPaymentRequestEmail: () => Promise<void>) {
  const user = await getWinnerUser(winner.userId)
  if (!user?.autoPay) return sendPaymentRequestEmail()

  const [paymentMethod, address] = await Promise.all([
    getDefaultPaymentMethod(winner.userId),
    prisma.address.findUnique({ where: { userId: winner.userId } })
  ])

  if (!paymentMethod?.stripePaymentId || !user.stripeCustomerId) {
    await createLog('warn', '[AUTO-PAY] skipped — no saved card', {
      userId: winner.userId,
      winningBidderId: winner.winningBidderId
    })
    return sendPaymentRequestEmail()
  }

  if (!address?.addressLine1 || !address.city || !address.state || !address.zipPostalCode) {
    await createLog('warn', '[AUTO-PAY] skipped — missing address', {
      userId: winner.userId,
      winningBidderId: winner.winningBidderId
    })
    return sendPaymentRequestEmail()
  }

  const processingFee = user.autoPayCoverFees ? calculateStripeFees(winner.totalPrice) : 0
  const finalAmount = Math.round((winner.totalPrice + processingFee) * 100) / 100
  const customerName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()

  try {
    const paymentIntent = await stripeClient.paymentIntents.create(
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

    if (paymentIntent.status !== 'succeeded') {
      await createLog('warn', '[AUTO-PAY] intent did not succeed', {
        userId: winner.userId,
        winningBidderId: winner.winningBidderId,
        status: paymentIntent.status
      })
      return sendPaymentRequestEmail()
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

    await sendConfirmationEmail(order)

    await createLog('info', '[AUTO-PAY] success', {
      userId: winner.userId,
      winningBidderId: winner.winningBidderId,
      amount: finalAmount,
      paymentIntentId: paymentIntent.id
    })
  } catch (error) {
    await createLog('error', '[AUTO-PAY] failed', {
      userId: winner.userId,
      winningBidderId: winner.winningBidderId,
      error: getErrorMessage(error)
    })

    return sendPaymentRequestEmail()
  }
}
