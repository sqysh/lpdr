import Stripe from 'stripe'
import { stripeClient } from '../stripe-client'
import prisma from 'prisma/client'
import { createLog } from 'lib/actions/log/createLog'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'
import { resend } from 'lib/email/resend'
import { paymentFailedTemplate } from 'lib/email/templates/payment-failed-template'

export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const invoiceWithSub = invoice as any

    let subscriptionId: string | null = null
    if (invoiceWithSub.parent?.subscription_details?.subscription) {
      subscriptionId = invoiceWithSub.parent.subscription_details.subscription
    }

    if (!subscriptionId) return

    const subscription = await stripeClient.subscriptions.retrieve(subscriptionId)
    const userId = subscription.metadata?.userId
    const amount = invoice.amount_due / 100

    const failureCode = (invoice as any).last_finalization_error?.code ?? null
    const failureReason = (invoice as any).last_finalization_error?.message ?? null
    const customerEmail = subscription.metadata?.email ?? invoice.customer_email
    const customerName = subscription.metadata?.name ?? null

    await prisma.order.updateMany({
      where: {
        stripeSubscriptionId: subscriptionId,
        status: 'PENDING'
      },
      data: {
        status: 'FAILED',
        failureCode,
        failureReason,
        failureEmailSentAt: new Date()
      }
    })

    // Send failure email if we have an address
    if (customerEmail) {
      await resend.emails.send({
        from: 'Little Paws <payments@littlepawsdr.org>',
        to: customerEmail,
        subject: 'Your donation payment failed',
        html: paymentFailedTemplate({
          name: customerName,
          amount,
          failureReason,
          myPackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/my-pack`
        })
      })
    }

    await createLog('error', 'Recurring donation payment failed', {
      invoiceId: invoice.id,
      subscriptionId,
      userId: userId ?? null,
      email: customerEmail,
      amount,
      failureCode,
      failureReason
    })

    await pusherSuperuser('recurring-payment-failed', {
      userId: userId ?? null,
      email: customerEmail,
      name: customerName,
      amount,
      subscriptionId,
      invoiceId: invoice.id
    })
  } catch (error) {
    await createLog('error', 'Error handling invoice payment failed', {
      invoiceId: invoice.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
