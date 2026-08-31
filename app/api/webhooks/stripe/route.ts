import { createLog } from 'lib/actions/log/createLog'
import { stripeClient } from 'lib/stripe/stripe-client'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import {
  handleInvoicePaymentFailed,
  handleInvoicePaymentSucceeded,
  handlePaymentIntentFailed,
  handlePaymentIntentSucceeded,
  handlePaymentMethodAttached,
  handlePaymentMethodDetached,
  handlePaymentMethodUpdated,
  handleSubscriptionCreated,
  handleSubscriptionDeleted,
  handleSubscriptionUpdated
} from 'lib/stripe/webhooks'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripeClient.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    await createLog('error', 'Webhook signature verification failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type as string) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent & {
          invoice?: string | null
        }
        if (paymentIntent.invoice) break
        await handlePaymentIntentSucceeded(paymentIntent)
        break
      }
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break
      case 'payment_method.attached':
        await handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod)
        break
      case 'payment_method.detached':
        await handlePaymentMethodDetached(event.data.object as Stripe.PaymentMethod)
        break
      case 'payment_method.updated':
        await handlePaymentMethodUpdated(event.data.object as Stripe.PaymentMethod)
        break
      case 'customer.subscription.created': {
        const newSub = event.data.object as Stripe.Subscription
        const fullSub = await stripeClient.subscriptions.retrieve(newSub.id)
        if (fullSub.status === 'incomplete') break
        if (fullSub.status === 'active') await handleSubscriptionCreated(fullSub)
        break
      }
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.updated': {
        const updatedSub = event.data.object as Stripe.Subscription
        const statusesToHandle = ['active', 'past_due', 'canceled', 'unpaid', 'incomplete']
        if (statusesToHandle.includes(updatedSub.status))
          await handleSubscriptionUpdated(updatedSub)
        break
      }
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
      default:
        await createLog('info', 'Unhandled webhook event', {
          eventType: event.type,
          eventId: event.id
        })
        break
    }
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    await createLog('error', 'Webhook handler failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
