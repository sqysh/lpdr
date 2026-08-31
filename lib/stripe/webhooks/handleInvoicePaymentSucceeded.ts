import Stripe from 'stripe'
import { stripeClient } from '../stripe-client'
import prisma from 'prisma/client'
import { RecurringFrequency } from '@prisma/client'
import { createLog } from 'lib/actions/log/createLog'
import sendConfirmationEmail from 'lib/email/sendConfirmatioinEmail'
import { pusherSuperuser, pusherTrigger } from 'lib/pusher/pusher.utils'

export async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const invoiceWithSub = invoice as any
    // Subscription ID - basil uses parent.subscription_details
    let subscriptionId: string | null = null
    if (invoiceWithSub.parent?.subscription_details?.subscription) {
      subscriptionId = invoiceWithSub.parent.subscription_details.subscription
    }

    if (!subscriptionId) {
      return
    }

    const isFirstPayment = invoice.billing_reason === 'subscription_create'

    let paymentIntentId: string | null = null
    const invoicePayments = await stripeClient.invoicePayments.list({ invoice: invoice.id })
    const defaultPayment = invoicePayments.data.find((p) => p.is_default)
    if (defaultPayment?.payment?.type === 'payment_intent') {
      paymentIntentId =
        typeof defaultPayment.payment.payment_intent === 'string'
          ? defaultPayment.payment.payment_intent
          : (defaultPayment.payment.payment_intent as any)?.id || null
    }

    // Check if order already exists
    const existingOrder = await prisma.order.findFirst({
      where: {
        stripeSubscriptionId: subscriptionId,
        ...(paymentIntentId && { paymentIntentId })
      }
    })

    if (existingOrder) {
      return
    }

    // Get the subscription details
    const subscriptionResponse = await stripeClient.subscriptions.retrieve(subscriptionId, {
      expand: ['default_payment_method']
    })

    const subscription = subscriptionResponse as Stripe.Subscription

    const userId = subscription.metadata?.userId

    const frequency = subscription.metadata?.frequency || 'MONTHLY'
    const amount = invoice.amount_paid / 100
    const coverFees = subscription.metadata?.coverFees === 'true'
    const feesCovered = parseFloat(subscription.metadata?.feesCovered || '0')

    function getNextBillingDate(subscription: any): Date {
      const frequency = subscription.metadata?.frequency || 'MONTHLY'
      const anchor = new Date(subscription.billing_cycle_anchor * 1000)

      if (frequency === 'YEARLY') {
        return new Date(anchor.setFullYear(anchor.getFullYear() + 1))
      }

      return new Date(anchor.setMonth(anchor.getMonth() + 1))
    }

    const geoUser = userId
      ? await prisma.user.findUnique({
          where: { id: userId },
          select: {
            lastGeoLatitude: true,
            lastGeoLongitude: true,
            lastGeoCity: true,
            lastGeoRegion: true,
            lastGeoCountry: true
          }
        })
      : null

    const order = await prisma.order.create({
      data: {
        type: 'RECURRING_DONATION',
        status: 'CONFIRMED',
        totalAmount: amount,
        customerEmail: subscription.metadata?.email || invoice.customer_email || '',
        customerName: subscription.metadata?.name || '',
        userId: userId && userId !== 'guest' ? userId : null,
        stripeSubscriptionId: subscriptionId,
        paymentIntentId: paymentIntentId || null,
        paymentMethodId:
          typeof subscription.default_payment_method === 'string'
            ? subscription.default_payment_method
            : subscription.default_payment_method?.id || null,
        isRecurring: true,
        recurringFrequency: frequency as RecurringFrequency,
        coverFees: coverFees,
        feesCovered: feesCovered,
        paidAt: invoice.status_transitions?.paid_at
          ? new Date(invoice.status_transitions.paid_at * 1000)
          : new Date(),
        nextBillingDate: getNextBillingDate(subscription),
        tierName: subscription.metadata.tierName || null,
        geoLatitude: geoUser?.lastGeoLatitude ?? null,
        geoLongitude: geoUser?.lastGeoLongitude ?? null,
        geoCity: geoUser?.lastGeoCity ?? null,
        geoRegion: geoUser?.lastGeoRegion ?? null,
        geoCountry: geoUser?.lastGeoCountry ?? null,
        geoSource: geoUser?.lastGeoLatitude != null ? 'ip' : null,
        isFirstPayment
      }
    })

    await createLog('info', `Recurring donation ${isFirstPayment ? 'created' : 'renewed'}`, {
      orderId: order.id,
      subscriptionId,
      amount,
      isFirstPayment
    })

    const orderWithItems = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { items: true }
    })

    // Only send confirmation email on first payment
    if (isFirstPayment) {
      await sendConfirmationEmail(orderWithItems)
    }

    const channelId = `payment-${subscriptionId}`

    await pusherTrigger(channelId, 'order-created', {
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
      userId: userId ?? null,
      email: order.customerEmail,
      name: order.customerName,
      amount,
      frequency,
      isFirstPayment,
      orderId: order.id,
      stripeSubscriptionId: subscriptionId
    })
  } catch (error) {
    await createLog('error', 'Error handling invoice payment', {
      invoiceId: invoice.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
