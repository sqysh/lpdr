import { createLog } from 'lib/actions/log/createLog'
import { resend } from 'lib/email/resend'
import sendConfirmationEmail from 'lib/email/sendConfirmatioinEmail'
import { auctionWinningBidderTemplate } from 'lib/email/templates/winning-bidder.template'
import { calculateStripeFees } from 'lib/stripe/calculateStripeFees'
import { stripeClient } from 'lib/stripe/stripe-client'
import prisma from 'prisma/client'

async function getWinnerUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      autoPay: true,
      autoPayCoverFees: true,
      email: true,
      firstName: true,
      stripeCustomerId: true
    }
  })
}

async function getDefaultPaymentMethod(userId: string) {
  return prisma.paymentMethod.findFirst({
    where: { userId, isDefault: true }
  })
}

async function markWinnerPaid(winningBidderId: string) {
  return prisma.auctionWinningBidder.update({
    where: { id: winningBidderId },
    data: {
      winningBidPaymentStatus: 'PAID',
      auctionItemPaymentStatus: 'PAID',
      paidOn: new Date()
    }
  })
}

async function createAuctionOrder(
  winner: Awaited<ReturnType<typeof resolveAuctionWinners>>[number],
  paymentIntentId: string,
  paymentMethodId: string,
  totalAmount: number,
  coverFees: boolean,
  feesCovered: number
) {
  const customerName = `${winner.user.firstName ?? ''} ${winner.user.lastName ?? ''}`.trim()

  // pull saved address for shipping if any items require it
  const userAddress = await prisma.user.findUnique({
    where: { id: winner.userId },
    select: {
      address: true,
      lastGeoLatitude: true,
      lastGeoLongitude: true,
      lastGeoCity: true,
      lastGeoRegion: true,
      lastGeoCountry: true
    }
  })

  const address = userAddress?.address as {
    addressLine1?: string
    addressLine2?: string
    city?: string
    state?: string
    zipPostalCode?: string
  } | null

  const order = await prisma.order.create({
    data: {
      type: 'AUCTION_PURCHASE',
      status: 'CONFIRMED',
      totalAmount,
      paymentIntentId,
      paymentMethodId,
      customerEmail: winner.user.email ?? '',
      customerName,
      userId: winner.userId,
      paidAt: new Date(),
      coverFees,
      feesCovered,
      addressLine1: address?.addressLine1 ?? null,
      addressLine2: address?.addressLine2 ?? null,
      city: address?.city ?? null,
      state: address?.state ?? null,
      zipPostalCode: address?.zipPostalCode ?? null,
      country: 'US',
      geoLatitude: userAddress?.lastGeoLatitude ?? null,
      geoLongitude: userAddress?.lastGeoLongitude ?? null,
      geoCity: userAddress?.lastGeoCity ?? null,
      geoRegion: userAddress?.lastGeoRegion ?? null,
      geoCountry: userAddress?.lastGeoCountry ?? null,
      geoSource: userAddress?.lastGeoLatitude != null ? 'ip' : null
    }
  })

  await prisma.orderItem.createMany({
    data: winner.items.map((item) => ({
      orderId: order.id,
      itemName: item.name,
      price: item.soldPrice,
      quantity: 1,
      subtotal: item.soldPrice,
      totalPrice: item.soldPrice
    }))
  })

  const orderWithItems = await prisma.order.findUniqueOrThrow({
    where: { id: order.id },
    include: { items: true }
  })

  return orderWithItems
}

export async function processAutoPay(
  winner: Awaited<ReturnType<typeof resolveAuctionWinners>>[number],
  auction: { id: string; title: string },
  sendPaymentRequestEmail: () => Promise<void>
) {
  const user = await getWinnerUser(winner.userId)
  if (!user?.autoPay) return sendPaymentRequestEmail()

  const [paymentMethod, address] = await Promise.all([
    getDefaultPaymentMethod(winner.userId),
    prisma.address.findUnique({ where: { userId: winner.userId } })
  ])

  if (!paymentMethod?.stripePaymentId || !user.stripeCustomerId) {
    return sendPaymentRequestEmail()
  }

  if (!address?.addressLine1 || !address?.city || !address?.state || !address?.zipPostalCode) {
    await createLog('warn', '[AUTO-PAY] skipped — missing address', {
      userId: winner.userId,
      winningBidderId: winner.winningBidderId
    })
    return sendPaymentRequestEmail()
  }

  const processingFee = user.autoPayCoverFees ? calculateStripeFees(winner.totalPrice) : 0
  const finalAmount = winner.totalPrice + processingFee
  const amountInCents = Math.round(finalAmount * 100)
  const customerName = `${winner.user.firstName ?? ''} ${winner.user.lastName ?? ''}`.trim()

  try {
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: amountInCents,
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
    })

    if (paymentIntent.status !== 'succeeded') return sendPaymentRequestEmail()

    await markWinnerPaid(winner.winningBidderId)

    const order = await createAuctionOrder(
      winner,
      paymentIntent.id,
      paymentMethod.stripePaymentId,
      finalAmount,
      user.autoPayCoverFees,
      processingFee
    )

    await sendConfirmationEmail(order)

    await createLog('info', '[AUTO-PAY] success', {
      userId: winner.userId,
      winningBidderId: winner.winningBidderId,
      amount: finalAmount,
      paymentIntentId: paymentIntent.id
    })
  } catch (err: any) {
    await createLog('error', '[AUTO-PAY] failed', {
      userId: winner.userId,
      winningBidderId: winner.winningBidderId,
      error: err?.message ?? 'Unknown error'
    })
    return sendPaymentRequestEmail()
  }
}

export async function resolveAuctionWinners(auctionId: string) {
  // 1. Get all TOP_BID bids for this auction, grouped by userId
  const topBids = await prisma.auctionBid.findMany({
    where: { auctionId, status: 'TOP_BID' },
    include: {
      auctionItem: true,
      user: { select: { id: true, firstName: true, lastName: true, email: true } }
    }
  })

  // 2. Group by userId
  const byUser = topBids.reduce<Record<string, typeof topBids>>((acc, bid) => {
    if (!acc[bid.userId]) acc[bid.userId] = []
    acc[bid.userId].push(bid)
    return acc
  }, {})

  const winningBidderMap: Record<string, string> = {}

  await prisma.$transaction(async (tx) => {
    for (const [userId, bids] of Object.entries(byUser)) {
      const totalPrice = bids.reduce((sum, b) => {
        const shipping = b.auctionItem.requiresShipping
          ? Number(b.auctionItem.shippingCosts ?? 0)
          : 0
        return sum + Number(b.bidAmount) + shipping
      }, 0)

      const totalShipping = bids.reduce((sum, b) => {
        return sum + (b.auctionItem.requiresShipping ? Number(b.auctionItem.shippingCosts ?? 0) : 0)
      }, 0)

      // 3. Create one AuctionWinningBidder per user
      const winningBidder = await tx.auctionWinningBidder.create({
        data: {
          auctionId,
          userId,
          totalPrice,
          shipping: totalShipping,
          winningBidPaymentStatus: 'AWAITING_PAYMENT',
          auctionItemPaymentStatus: 'PENDING',
          shippingStatus: 'PENDING_PAYMENT_CONFIRMATION'
        }
      })

      // Collect the IDs during the transaction loop:
      winningBidderMap[userId] = winningBidder.id

      // 4. Update each won AuctionItem — set status SOLD, soldPrice, link to winningBidder
      for (const bid of bids) {
        await tx.auctionItem.update({
          where: { id: bid.auctionItemId },
          data: {
            status: 'SOLD',
            soldPrice: bid.bidAmount,
            auctionWinningBidderId: winningBidder.id
          }
        })
      }

      // 5. Any item that wasn't just set to SOLD in the winner loop gets marked UNSOLD in one shot
      await tx.auctionItem.updateMany({
        where: {
          auctionId,
          status: { not: 'SOLD' }
        },
        data: { status: 'UNSOLD' }
      })

      // 6. Update winner's AuctionBidder status to ACTIVE (they won)
      await tx.auctionBidder.updateMany({
        where: { auctionId, userId },
        data: { status: 'WINNER' }
      })
    }

    // 6. Set all non-winning bidders to LOST
    const winnerIds = Object.keys(byUser)
    await tx.auctionBidder.updateMany({
      where: {
        auctionId,
        userId: { notIn: winnerIds }
      },
      data: { status: 'LOST' }
    })
  })

  // 8. Return winners grouped for email sending
  return Object.entries(byUser).map(([userId, bids]) => ({
    userId,
    winningBidderId: winningBidderMap[userId],
    user: bids[0].user,
    items: bids.map((b) => ({
      id: b.auctionItemId,
      name: b.auctionItem.name,
      soldPrice: Number(b.bidAmount)
    })),
    totalPrice: bids.reduce((sum, b) => sum + Number(b.bidAmount), 0)
  }))
}

export async function sendWinnerEmail({
  email,
  firstName,
  auctionId,
  winningBidderId,
  items,
  totalPrice
}: {
  email: string
  firstName: string
  auctionId: string
  winningBidderId: string
  items: { name: string; soldPrice: number }[]
  totalPrice: number
}) {
  const BASE =
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://littlepawsdr.org'
  const url = `${BASE}/auctions/winner/${winningBidderId}`

  try {
    const result = await resend.emails.send({
      from: `Little Paws Dachshund Rescue <${process.env.RESEND_FROM_EMAIL!}>`,
      to: email,
      subject: 'You won items in the Little Paws Auction!',
      html: auctionWinningBidderTemplate({ url, firstName, items, totalPrice })
    })
    await createLog('info', 'Winner email sent successfully', {
      location: ['sendWinnerEmail.ts'],
      email,
      auctionId,
      winningBidderId,
      messageId: result.data?.id
    })
  } catch (error) {
    await createLog('error', 'Failed to send winner email', {
      location: ['sendWinnerEmail.ts'],
      email,
      auctionId,
      winningBidderId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    throw error
  }
}
