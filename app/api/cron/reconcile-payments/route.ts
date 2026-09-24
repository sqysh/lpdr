import { NextResponse } from 'next/server'
import prisma from 'prisma/client'
import { createLog } from 'lib/actions/log/createLog'
import { stripeClient } from 'lib/stripe/stripe-client'
import { resend } from 'lib/email/resend'
import { paymentMismatchTemplate } from 'lib/email/templates/payment-mismatch.template'
import type Stripe from 'stripe'

/**
 * Every succeeded charge should have an order behind it. On Sep 16 five did not, for twelve
 * hours, and the only reason anyone noticed was someone happening to look at the orders list.
 * Stripe had been 308ing on the apex domain and webhooks do not follow redirects.
 *
 * This is the check that would have caught it the same evening. It runs against Stripe rather
 * than against our own logs on purpose: when the webhook never arrives, our logs say nothing.
 */
const LOOKBACK_HOURS = 36

// A payment that succeeded in the last few minutes may simply not have been processed yet.
const SETTLE_MINUTES = 15

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const start = Date.now()

  try {
    const since = Math.floor((Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000) / 1000)
    const settledBefore = Date.now() - SETTLE_MINUTES * 60 * 1000

    const succeeded: Stripe.PaymentIntent[] = []

    // Auto-pagination: a single page of 100 can fill up on a busy night, and anything past it went unchecked
    for await (const pi of stripeClient.paymentIntents.list({ created: { gte: since }, limit: 100 })) {
      if (pi.status === 'succeeded' && pi.created * 1000 < settledBefore) succeeded.push(pi)
    }

    if (succeeded.length === 0) {
      await createLog('info', '[CRON] reconcile-payments', {
        cronName: 'reconcile-payments',
        status: 'skipped',
        durationMs: Date.now() - start,
        detail: 'No settled payments in the window'
      })
      return NextResponse.json({ success: true, checked: 0, missing: 0 })
    }

    const orders = await prisma.order.findMany({
      where: { paymentIntentId: { in: succeeded.map((pi) => pi.id) } },
      select: { paymentIntentId: true }
    })

    const accountedFor = new Set(orders.map((o) => o.paymentIntentId))
    const missing = succeeded.filter((pi) => !accountedFor.has(pi.id))

    if (missing.length === 0) {
      await createLog('info', '[CRON] reconcile-payments', {
        cronName: 'reconcile-payments',
        status: 'success',
        durationMs: Date.now() - start,
        detail: `${succeeded.length} payment(s) checked, all accounted for`
      })
      return NextResponse.json({ success: true, checked: succeeded.length, missing: 0 })
    }

    const rows = missing.map((pi) => ({
      paymentIntentId: pi.id,
      amount: pi.amount / 100,
      email: (pi.metadata?.email as string) || pi.receipt_email || 'unknown',
      orderType: (pi.metadata?.orderType as string) || 'unknown',
      createdAt: new Date(pi.created * 1000).toISOString()
    }))

    await createLog('error', '[CRON] reconcile-payments', {
      cronName: 'reconcile-payments',
      status: 'error',
      durationMs: Date.now() - start,
      detail: `${missing.length} succeeded payment(s) with no order`,
      payments: rows
    })

    const { error: emailError } = await resend.emails.send({
      from: `Little Paws Dachshund Rescue <${process.env.RESEND_FROM_EMAIL!}>`,
      to: process.env.ALERT_EMAIL!,
      subject: `${missing.length} payment${missing.length === 1 ? '' : 's'} with no order`,
      html: paymentMismatchTemplate({ payments: rows })
    })

    if (emailError) {
      await createLog('error', 'Payment mismatch alert email failed to send', { error: emailError.message, missing: rows.length })
    }

    return NextResponse.json({ success: true, checked: succeeded.length, missing: missing.length })
  } catch (error) {
    await createLog('error', '[CRON] reconcile-payments', {
      cronName: 'reconcile-payments',
      status: 'error',
      durationMs: Date.now() - start,
      detail: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json({ error: 'Reconciliation failed' }, { status: 500 })
  }
}
