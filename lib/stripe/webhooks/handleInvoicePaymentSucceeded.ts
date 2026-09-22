import Stripe from 'stripe'
import { stripeClient } from '../stripe-client'
import prisma from 'prisma/client'
import { RecurringFrequency } from '@prisma/client'
import { createLog } from 'lib/actions/log/createLog'
import sendConfirmationEmail from 'lib/email/sendConfirmationEmail'
import { pusherSuperuser, pusherTrigger } from 'lib/pusher/pusher.utils'

export async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId =
    invoice.parent?.type === 'subscription_details' ? (invoice.parent.subscription_details?.subscription as string | undefined) : undefined

  if (!subscriptionId) return

  try {
    // Each billing cycle has its own invoice, so it can't collide across renewals the way a
    // subscription id can when the payment intent lookup comes back empty
    const existingOrder = await prisma.order.findUnique({ where: { stripeInvoiceId: invoice.id }, select: { id: true } })
    if (existingOrder) return

    const isFirstPayment = invoice.billing_reason === 'subscription_create'

    const invoicePayments = await stripeClient.invoicePayments.list({ invoice: invoice.id })
    const payment = invoicePayments.data.find((p) => p.is_default)?.payment
    const paymentIntentId =
      payment?.type === 'payment_intent'
        ? typeof payment.payment_intent === 'string'
          ? payment.payment_intent
          : (payment.payment_intent?.id ?? null)
        : null

    const subscription = await stripeClient.subscriptions.retrieve(subscriptionId, { expand: ['default_payment_method'] })

    const meta = subscription.metadata ?? {}
    const userId = meta.userId || null
    const frequency = (meta.frequency || 'MONTHLY') as RecurringFrequency
    const amount = invoice.amount_paid / 100
    const coverFees = meta.coverFees === 'true'
    const feesCovered = parseFloat(meta.feesCovered || '0')

    // The period this invoice paid for ends at the next charge. The subscription line is found rather
    // than assumed first, since prorations and pending items sort ahead of it
    const subscriptionLine = invoice.lines?.data?.find((l) => l.parent?.type === 'subscription_item_details')
    const periodEnd = subscriptionLine?.period?.end
    const nextBillingDate = periodEnd ? new Date(periodEnd * 1000) : null

    const geoUser = userId
      ? await prisma.user.findUnique({
          where: { id: userId },
          select: { lastGeoLatitude: true, lastGeoLongitude: true, lastGeoCity: true, lastGeoRegion: true, lastGeoCountry: true }
        })
      : null

    const order = await prisma.order.create({
      data: {
        type: 'RECURRING_DONATION',
        status: 'CONFIRMED',
        totalAmount: amount,
        subtotal: parseFloat(meta.subtotal ?? '0'),
        coverFees,
        feesCovered,
        customerEmail: meta.email || invoice.customer_email || '',
        customerName: meta.name || '',
        userId,
        stripeSubscriptionId: subscriptionId,
        stripeInvoiceId: invoice.id,
        paymentIntentId,
        paymentMethodId:
          typeof subscription.default_payment_method === 'string'
            ? subscription.default_payment_method
            : (subscription.default_payment_method?.id ?? null),
        isRecurring: true,
        recurringFrequency: frequency,
        paidAt: invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1000) : new Date(),
        nextBillingDate,
        tierName: meta.tierName || null,
        isFirstPayment,
        isPhysical: false,
        // A dedication belongs to the gift, not to every renewal of it
        donorMessage: isFirstPayment ? meta.donorMessage || null : null,
        geoLatitude: geoUser?.lastGeoLatitude ?? null,
        geoLongitude: geoUser?.lastGeoLongitude ?? null,
        geoCity: geoUser?.lastGeoCity ?? null,
        geoRegion: geoUser?.lastGeoRegion ?? null,
        geoCountry: geoUser?.lastGeoCountry ?? null,
        geoSource: geoUser?.lastGeoLatitude != null ? 'ip' : null
      }
    })

    await createLog('info', `Recurring donation ${isFirstPayment ? 'created' : 'renewed'}`, {
      orderId: order.id,
      subscriptionId,
      invoiceId: invoice.id,
      amount,
      isFirstPayment
    })

    // Notifications are best effort. The order exists and the money has moved, so a failure here must
    // not become a retry that hits the existing-order check and leaves the donor with no confirmation
    try {
      if (isFirstPayment) {
        const orderWithItems = await prisma.order.findUniqueOrThrow({ where: { id: order.id }, include: { items: true } })
        void sendConfirmationEmail(orderWithItems).catch((error) =>
          createLog('error', 'Failed to send recurring donation confirmation', {
            orderId: order.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        )
      }

      await pusherTrigger(`payment-${subscriptionId}`, 'order-created', {
        orderId: order.id,
        amount: order.totalAmount,
        status: order.status,
        type: order.type,
        frequency,
        coverFees,
        feesCovered,
        createdAt: order.createdAt
      })

      await pusherSuperuser('recurring-donation', {
        userId,
        email: order.customerEmail,
        name: order.customerName,
        amount,
        frequency,
        isFirstPayment,
        orderId: order.id,
        stripeSubscriptionId: subscriptionId,
        donorMessage: order.donorMessage
      })
    } catch (error) {
      await createLog('warn', 'Notification failed after recurring order created', {
        orderId: order.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  } catch (error) {
    await createLog('error', 'Failed to create order from invoice', {
      invoiceId: invoice.id,
      subscriptionId,
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    // Rethrow so the route returns a non-200 and Stripe retries. The invoice check makes the retry safe
    throw error
  }
}
