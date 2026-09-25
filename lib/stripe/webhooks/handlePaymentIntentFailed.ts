import { OrderType } from '@prisma/client'
import { createLog } from 'lib/actions/log/createLog'
import { resend } from 'lib/email/resend'
import { paymentFailedTemplate } from 'lib/email/templates/payment-failed.template'
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

    // Stripe doesn't guarantee event order, so an earlier attempt's failure can arrive after the payment
    // succeeded on a retry. A confirmed or refunded order is final: it's never turned back into a failure,
    // and the customer isn't told a payment failed that actually went through
    const existing = await prisma.order.findUnique({ where: { paymentIntentId: id }, select: { status: true } })
    if (existing && existing.status !== 'FAILED') {
      await createLog('info', 'Late payment failure ignored; the payment has since succeeded', {
        paymentIntentId: id,
        status: existing.status
      })
      return
    }

    const order = await prisma.order.upsert({
      where: { paymentIntentId: id },
      update: { status: 'FAILED', failureReason, failureCode },
      create: {
        type: orderType,
        status: 'FAILED',
        totalAmount: paymentIntent.amount / 100,
        paymentIntentId: id,
        customerEmail: customerEmail ?? '',
        customerName: customerName ?? '',
        userId,
        failureReason,
        failureCode
      }
    })

    if (customerEmail) {
      const { error } = await resend.emails.send({
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

      // Only recorded once Resend accepts it, so the column reflects emails that actually went out
      if (error) {
        await createLog('error', 'Payment failed email not sent', { orderId: order.id, error: error.message })
      } else {
        await prisma.order.update({ where: { id: order.id }, data: { failureEmailSentAt: new Date() } })
      }
    }

    if (userId) {
      await pusherTrigger(`payment-${userId}`, 'order-failed', { orderId: order.id, error: failureReason, type: orderType })
    }

    await pusherSuperuser('order-failed', {
      userId,
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
