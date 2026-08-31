import { OrderType } from '@prisma/client'
import { createLog } from 'lib/actions/log/createLog'
import { resend } from 'lib/email/resend'
import { paymentFailedTemplate } from 'lib/email/templates/payment-failed-template'
import { pusherSuperuser, pusherTrigger } from 'lib/pusher/pusher.utils'
import prisma from 'prisma/client'
import Stripe from 'stripe'

export async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { id, last_payment_error, metadata } = paymentIntent

  try {
    const orderType = (metadata?.orderType as OrderType) || 'ONE_TIME_DONATION'
    const userId = metadata?.userId || null
    const customerEmail = metadata?.email || null
    const customerName = metadata?.name || null
    const failureReason = last_payment_error?.message || 'Payment failed'
    const failureCode = last_payment_error?.code || null

    const order = await prisma.order.upsert({
      where: { paymentIntentId: id },
      update: {
        status: 'FAILED',
        failureReason,
        failureCode,
        failureEmailSentAt: customerEmail ? new Date() : null
      },
      create: {
        type: orderType,
        status: 'FAILED',
        totalAmount: paymentIntent.amount / 100,
        paymentIntentId: id,
        customerEmail: customerEmail ?? '',
        customerName: customerName ?? '',
        userId,
        failureReason,
        failureCode,
        failureEmailSentAt: customerEmail ? new Date() : null
      }
    })

    if (customerEmail) {
      await resend.emails.send({
        from: 'Little Paws <payments@littlepawsdr.org>',
        to: customerEmail,
        subject: "Your payment didn't go through",
        html: paymentFailedTemplate({
          name: customerName,
          amount: paymentIntent.amount / 100,
          failureReason,
          myPackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/my-pack`
        })
      })
    }

    await pusherTrigger(`payment-${userId}`, 'order-failed', {
      orderId: order.id,
      error: failureReason,
      type: orderType
    })

    await pusherSuperuser('order-failed', {
      userId: userId ?? null,
      email: order.customerEmail,
      name: order.customerName,
      amount: order.totalAmount,
      type: orderType,
      orderId: order.id,
      paymentIntentId: id,
      failureReason,
      failureCode
    })

    await createLog('warn', 'Payment failed from Stripe webhook', {
      orderId: order.id,
      userId,
      type: orderType,
      paymentIntentId: id,
      failureReason,
      failureCode
    })
  } catch (error) {
    await createLog('error', 'Error handling payment failure', {
      error: error instanceof Error ? error.message : 'Unknown error',
      paymentIntentId: id
    })
  }
}
