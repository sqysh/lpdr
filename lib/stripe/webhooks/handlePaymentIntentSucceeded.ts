import { OrderType, RecurringFrequency } from '@prisma/client'
import { createLog } from 'lib/actions/log/createLog'
import { FEED_A_FOSTER_ITEMS } from 'lib/constants/feed-a-foster.constants'
import { resend } from 'lib/email/resend'
import sendConfirmationEmail from 'lib/email/sendConfirmatioinEmail'
import { adminOrderNotificationTemplate } from 'lib/email/templates/admin-order-notification.template'
import { pusherSuperuser, pusherTrigger } from 'lib/pusher/pusher.utils'
import prisma from 'prisma/client'
import Stripe from 'stripe'
import { ProductSizeEntry } from 'types/_product'
import { WelcomeWienerProduct } from 'types/_welcome-wiener'

export async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { id, amount, metadata } = paymentIntent

  try {
    if (!metadata?.orderType) return

    const existingOrder = await prisma.order.findFirst({
      where: { paymentIntentId: id }
    })
    if (existingOrder) return

    const orderType = (metadata?.orderType as OrderType) || 'ONE_TIME_DONATION'
    const userId = metadata?.userId || null
    const isRecurring = metadata?.isRecurring === 'true'
    const nbd = isRecurring && metadata?.nextBillingDate ? new Date(metadata.nextBillingDate) : null

    // ── Resolve items + hasPhysical BEFORE creating the order ──
    const compact =
      orderType === 'PURCHASE' && metadata?.items
        ? (JSON.parse(metadata.items) as Array<{ i: string; q: number; s: string | null }>)
        : []

    const FEED_A_FOSTER_IDS = Object.keys(FEED_A_FOSTER_ITEMS)
    const wienerLines = compact.filter((c) => !FEED_A_FOSTER_IDS.includes(c.i) && c.i.includes('-'))
    const wienerIds = [...new Set(wienerLines.map((c) => c.i.split('-')[0]))]
    const ids = compact.map((c) => c.i)

    const [products, wieners, winningBidder, instantBuyItem] = await Promise.all([
      ids.length ? prisma.product.findMany({ where: { id: { in: ids } } }) : Promise.resolve([]),
      wienerIds.length ? prisma.welcomeWiener.findMany({ where: { id: { in: wienerIds } } }) : Promise.resolve([]),
      orderType === 'AUCTION_PURCHASE' && metadata?.winningBidderId
        ? prisma.auctionWinningBidder.findUnique({
            where: { id: metadata.winningBidderId },
            include: { auctionItems: { select: { requiresShipping: true } } }
          })
        : Promise.resolve(null),
      orderType === 'AUCTION_PURCHASE' && metadata?.auctionItemId && !metadata?.winningBidderId
        ? prisma.auctionItem.findUnique({
            where: { id: metadata.auctionItemId },
            select: { requiresShipping: true }
          })
        : Promise.resolve(null)
    ])

    const hasPhysical =
      orderType === 'PURCHASE'
        ? compact.some((line) => {
            const product = products.find((p) => p.id === line.i)
            return product?.isPhysicalProduct ?? false
          })
        : (winningBidder?.auctionItems?.some((item) => item.requiresShipping) ?? instantBuyItem?.requiresShipping ?? false)

    const geoUser = userId
      ? await prisma.user.findUnique({
          where: { id: userId },
          select: {
            lastGeoLatitude: true,
            lastGeoLongitude: true,
            lastGeoCity: true,
            lastGeoRegion: true,
            lastGeoCountry: true,
            address: true,
            firstName: true,
            lastName: true
          }
        })
      : null

    const address = geoUser?.address as {
      addressLine1?: string
      addressLine2?: string
      city?: string
      state?: string
      zipPostalCode?: string
    } | null

    const order = await prisma.order.create({
      data: {
        type: orderType,
        status: 'CONFIRMED',
        totalAmount: amount / 100,
        paymentIntentId: id,
        customerEmail: metadata?.email || '',
        customerName: metadata?.name?.trim() || '',
        userId,
        paidAt: new Date(),
        addressLine1: address?.addressLine1 ?? null,
        addressLine2: address?.addressLine2 ?? null,
        city: address?.city ?? null,
        state: address?.state ?? null,
        zipPostalCode: address?.zipPostalCode ?? null,
        country: 'US',
        coverFees: metadata?.coverFees === 'true',
        feesCovered: parseFloat(metadata?.feesCovered || '0') || 0,
        isRecurring,
        recurringFrequency: isRecurring ? ((metadata?.recurringFrequency as RecurringFrequency) ?? null) : null,
        stripeSubscriptionId: isRecurring ? (metadata?.stripeSubscriptionId ?? null) : null,
        nextBillingDate: nbd && !isNaN(+nbd) ? nbd : null,
        paymentMethodId: (paymentIntent.payment_method as string) || null,
        shippingStatus: hasPhysical ? 'PENDING_FULFILLMENT' : null,
        geoLatitude: geoUser?.lastGeoLatitude ?? null,
        geoLongitude: geoUser?.lastGeoLongitude ?? null,
        geoCity: geoUser?.lastGeoCity ?? null,
        geoRegion: geoUser?.lastGeoRegion ?? null,
        geoCountry: geoUser?.lastGeoCountry ?? null,
        geoSource: geoUser?.lastGeoLatitude != null ? 'ip' : null
      }
    })

    // ── Now create order items using the already-fetched products/wieners ──
    if (orderType === 'PURCHASE' && compact.length > 0) {
      for (const line of compact) {
        if (line.i in FEED_A_FOSTER_ITEMS) {
          const { name, price } = FEED_A_FOSTER_ITEMS[line.i]
          await prisma.orderItem.create({
            data: {
              orderId: order.id,
              itemType: 'FEED_A_FOSTER',
              itemName: name,
              itemImage: null,
              iconKey: line.i,
              price,
              quantity: line.q,
              subtotal: price * line.q,
              totalPrice: price * line.q,
              isPhysical: false
            }
          })
          continue
        }

        const product = products.find((p) => p.id === line.i)

        if (product) {
          const price = Number(product.price)
          const shipping = Number(product.shippingPrice)

          await prisma.orderItem.create({
            data: {
              orderId: order.id,
              itemType: 'PRODUCT',
              productId: product.id,
              itemName: product.name ?? '',
              itemImage: product.images[0] ?? null,
              price,
              shippingPrice: shipping,
              quantity: line.q,
              subtotal: price * line.q,
              totalPrice: price * line.q + shipping,
              isPhysical: product.isPhysicalProduct,
              size: line.s ?? null
            }
          })

          const fresh = await prisma.product.findUnique({
            where: { id: product.id },
            select: { sizes: true, countInStock: true }
          })
          if (fresh) {
            const sizes = fresh.sizes as ProductSizeEntry[] | null
            const updatedSizes =
              line.s && sizes
                ? sizes.map((s) => (s.size === line.s ? { ...s, quantity: Math.max(0, s.quantity - line.q) } : s))
                : sizes

            await prisma.product.update({
              where: { id: product.id },
              data: {
                sizes: updatedSizes ?? undefined,
                countInStock: Math.max(0, (fresh.countInStock ?? 0) - line.q)
              }
            })
          }
          continue
        }

        const [wienerId, ...productIdParts] = line.i.split('-')
        const productId = productIdParts.join('-')
        const wiener = wieners.find((w) => w.id === wienerId)
        if (!wiener) {
          await createLog('warn', 'Order item could not be resolved', {
            orderId: order.id,
            itemId: line.i
          })
          continue
        }

        const options = wiener.associatedProducts as unknown as WelcomeWienerProduct[]
        const option = options.find((o) => o.id === productId)
        const price = Number(option?.price ?? 0)

        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            itemType: 'WELCOME_WIENER',
            welcomeWienerId: wiener.id,
            itemName: option ? `${option.name} for ${wiener.name}` : (wiener.name ?? ''),
            itemImage: option?.image ?? wiener.images[0] ?? null,
            price,
            quantity: line.q,
            subtotal: price * line.q,
            totalPrice: price * line.q,
            isPhysical: wiener.isPhysicalProduct,
            size: null
          }
        })
      }
    }

    if (orderType === 'AUCTION_PURCHASE') {
      // ── Instant buy (fixed price) ────────────────────────────────
      if (metadata?.auctionItemId && !metadata?.winningBidderId) {
        await prisma.$transaction(async (tx) => {
          const auctionItem = await tx.auctionItem.findUnique({
            where: { id: metadata.auctionItemId },
            include: {
              auction: { select: { id: true, supporterEmails: true, totalAuctionRevenue: true } },
              photos: { take: 1 }
            }
          })

          if (!auctionItem) throw new Error(`AuctionItem not found: ${metadata.auctionItemId}`)

          await tx.auctionItemInstantBuyer.create({
            data: {
              auctionId: auctionItem.auctionId,
              auctionItemId: auctionItem.id,
              userId: metadata.userId,
              name: metadata.name,
              email: metadata.email,
              totalPrice: Number(auctionItem.buyNowPrice ?? 0),
              paymentStatus: 'PAID',
              shippingStatus: auctionItem.requiresShipping ? 'PENDING_FULFILLMENT' : 'DIGITAL'
            }
          })

          const newQuantity = (auctionItem.totalQuantity ?? 1) - 1

          await tx.auctionItem.update({
            where: { id: auctionItem.id },
            data: {
              totalQuantity: newQuantity,
              ...(newQuantity <= 0 ? { status: 'SOLD' } : {})
            }
          })

          const auction = auctionItem.auction
          const updatedEmails =
            metadata.email && !auction.supporterEmails.includes(metadata.email)
              ? [...auction.supporterEmails, metadata.email]
              : auction.supporterEmails

          await tx.auction.update({
            where: { id: auction.id },
            data: {
              supporterEmails: updatedEmails,
              supporters: updatedEmails.length,
              totalAuctionRevenue: { increment: Number(auctionItem.buyNowPrice ?? 0) }
            }
          })

          await tx.orderItem.create({
            data: {
              orderId: order.id,
              itemType: 'AUCTION_INSTANT_BUY',
              itemName: auctionItem.name,
              itemImage: auctionItem.photos[0]?.url ?? null,
              price: Number(auctionItem.buyNowPrice ?? 0),
              quantity: 1,
              subtotal: Number(auctionItem.buyNowPrice ?? 0),
              totalPrice: Number(auctionItem.buyNowPrice ?? 0),
              isPhysical: auctionItem.requiresShipping
            }
          })
        })
      }

      // ── Auction winner (bid) ─────────────────────────────────────
      else if (metadata?.winningBidderId) {
        await prisma.$transaction(async (tx) => {
          const winningBidderRecord = await tx.auctionWinningBidder.update({
            where: { id: metadata.winningBidderId },
            data: {
              winningBidPaymentStatus: 'PAID',
              auctionItemPaymentStatus: 'PAID',
              shippingStatus: 'PENDING_FULFILLMENT',
              paidOn: new Date(),
              processingFee: metadata?.coverFees === 'true' ? parseFloat(metadata.feesCovered || '0') || 0 : 0
            },
            include: {
              user: { select: { email: true } },
              auction: { select: { id: true, supporterEmails: true, totalAuctionRevenue: true } },
              auctionItems: { include: { photos: { take: 1 } } }
            }
          })

          const auction = winningBidderRecord.auction
          const userEmail = winningBidderRecord.user?.email
          const updatedEmails =
            userEmail && !auction.supporterEmails.includes(userEmail)
              ? [...auction.supporterEmails, userEmail]
              : auction.supporterEmails

          await tx.auction.update({
            where: { id: auction.id },
            data: {
              supporterEmails: updatedEmails,
              supporters: updatedEmails.length,
              totalAuctionRevenue: { increment: winningBidderRecord.totalPrice ?? 0 }
            }
          })

          if (winningBidderRecord.auctionItems?.length > 0) {
            await tx.orderItem.createMany({
              data: winningBidderRecord.auctionItems.map((item) => ({
                orderId: order.id,
                itemType: 'AUCTION_WINNING_BID',
                itemName: item.name,
                itemImage: null,
                price: Number(item.soldPrice ?? item.currentBid ?? item.buyNowPrice ?? 0),
                quantity: 1,
                subtotal: Number(item.soldPrice ?? item.currentBid ?? item.buyNowPrice ?? 0),
                totalPrice: Number(item.soldPrice ?? item.currentBid ?? item.buyNowPrice ?? 0),
                isPhysical: item.requiresShipping
              }))
            })
          }
        })
      }
    }

    let adoptionFee: { id: string } | undefined
    let existingAdoptionFee: { id: string } | null = null

    if (orderType === 'ADOPTION_FEE') {
      const userId = metadata.userId

      existingAdoptionFee = await prisma.adoptionFee.findFirst({
        where: {
          userId,
          status: 'ACTIVE',
          expiresAt: { gt: new Date() }
        },
        select: { id: true }
      })

      if (!existingAdoptionFee) {
        adoptionFee = await prisma.adoptionFee.create({
          data: {
            userId,
            orderId: order.id,
            feeAmount: amount / 100,
            status: 'ACTIVE',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            email: metadata.email,
            firstName: geoUser?.firstName ?? null,
            lastName: geoUser?.lastName ?? null
          }
        })
      }
    }

    const orderWithItems = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { items: true }
    })

    await sendConfirmationEmail(orderWithItems)

    if (hasPhysical && orderWithItems.addressLine1) {
      await resend.emails.send({
        from: 'Little Paws Dachshund Rescue <orders@littlepawsdr.org>',
        to: 'lpdr@littlepawsdr.org',
        subject: `New order to ship — #${orderWithItems.id.slice(-8).toUpperCase()}`,
        html: adminOrderNotificationTemplate({
          orderId: orderWithItems.id,
          customerName: orderWithItems.customerName,
          customerEmail: orderWithItems.customerEmail,
          items: orderWithItems.items.map((i) => ({ name: i.itemName, quantity: i.quantity })),
          addressLine1: orderWithItems.addressLine1,
          addressLine2: orderWithItems.addressLine2,
          city: orderWithItems.city,
          state: orderWithItems.state,
          zipPostalCode: orderWithItems.zipPostalCode
        })
      })
    }

    const channelId = userId

    await pusherTrigger(`payment-${channelId}`, 'order-created', {
      orderId: order.id,
      amount: order.totalAmount,
      status: order.status,
      type: order.type,
      createdAt: order.createdAt,
      adoptionFeeId: adoptionFee?.id ?? existingAdoptionFee?.id ?? null
    })

    await pusherSuperuser('order-created', {
      userId: userId ?? null,
      email: order.customerEmail,
      name: order.customerName,
      amount: order.totalAmount,
      type: orderType,
      orderId: order.id,
      paymentIntentId: id
    })

    await createLog('info', 'Order created from payment intent', {
      orderId: order.id,
      userId,
      type: orderType,
      paymentIntentId: id,
      amount: amount / 100
    })
  } catch (error) {
    await createLog('error', 'Failed to create order from payment intent', {
      error: error instanceof Error ? error.message : 'Unknown error',
      amount: amount / 100,
      paymentIntentId: id
    })
  }
}
