'use server'

import prisma from 'prisma/client'
import Stripe from 'stripe'

export type HealthStatus = 'ok' | 'warn' | 'error' | 'unknown'

export interface ServiceHealth {
  name: string
  status: HealthStatus
  latency?: string
  detail: string
  lastChecked: string
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-08-27.basil' })

/* ── helpers ── */

function fmt(ms: number) {
  return `${ms}ms`
}

/* ── individual checks ── */

async function checkPostgres(): Promise<ServiceHealth> {
  const start = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    const latency = Date.now() - start
    const status: HealthStatus = latency > 500 ? 'warn' : 'ok'
    return {
      name: 'PostgreSQL / Prisma',
      status,
      latency: fmt(latency),
      detail: status === 'warn' ? 'Slow query response — monitoring' : 'All connections healthy',
      lastChecked: 'just now'
    }
  } catch (e) {
    return {
      name: 'PostgreSQL / Prisma',
      status: 'error',
      detail: e instanceof Error ? e.message : 'Connection failed',
      lastChecked: 'just now'
    }
  }
}

async function checkStripe(): Promise<ServiceHealth> {
  try {
    // Pull the most recent webhook event to see when Stripe last talked to us
    const events = await stripe.events.list({ limit: 1 })
    const lastEvent = events.data[0]
    const ageMs = lastEvent ? Date.now() - lastEvent.created * 1000 : null
    const ageMin = ageMs ? Math.floor(ageMs / 60000) : null

    // Also check for recent failures in the webhook log
    const failedEvents = await stripe.events.list({
      limit: 10,
      type: 'payment_intent.payment_failed',
      created: { gte: Math.floor((Date.now() - 3600000) / 1000) } // last 1hr
    })

    const recentFailures = failedEvents.data.length
    const status: HealthStatus = recentFailures >= 3 ? 'warn' : 'ok'

    return {
      name: 'Stripe Webhooks',
      status,
      latency: '—',
      detail:
        ageMin !== null
          ? `Last event received ${ageMin} min ago${recentFailures > 0 ? ` · ${recentFailures} payment failures in last hr` : ''}`
          : 'No recent events',
      lastChecked: 'just now'
    }
  } catch (e) {
    return {
      name: 'Stripe Webhooks',
      status: 'error',
      detail: e instanceof Error ? e.message : 'Stripe API unreachable',
      lastChecked: 'just now'
    }
  }
}

async function checkResend(): Promise<ServiceHealth> {
  const start = Date.now()
  try {
    const res = await fetch('https://resend.com', { method: 'HEAD' })
    const latency = Date.now() - start
    const status: HealthStatus = !res.ok ? 'warn' : latency > 1000 ? 'warn' : 'ok'
    return {
      name: 'Resend (Email)',
      status,
      latency: `${latency}ms`,
      detail: status === 'warn' ? 'Elevated latency' : 'Service reachable',
      lastChecked: 'just now'
    }
  } catch (e) {
    return {
      name: 'Resend (Email)',
      status: 'error',
      detail: e instanceof Error ? e.message : 'Unreachable',
      lastChecked: 'just now'
    }
  }
}

async function checkPusher(): Promise<ServiceHealth> {
  const start = Date.now()
  try {
    // Pusher's channels API — list active channels on your app
    const appId = process.env.PUSHER_APP_ID!
    const key = process.env.PUSHER_KEY!
    const secret = process.env.PUSHER_SECRET!
    const cluster = process.env.PUSHER_CLUSTER!

    const path = `/apps/${appId}/channels`
    const timestamp = Math.floor(Date.now() / 1000)
    const params = `auth_key=${key}&auth_timestamp=${timestamp}&auth_version=1.0`

    // Pusher requires an HMAC-SHA256 signature
    const { createHmac } = await import('crypto')
    const toSign = `GET\n${path}\n${params}`
    const authSig = createHmac('sha256', secret).update(toSign).digest('hex')

    const res = await fetch(`https://api-${cluster}.pusher.com${path}?${params}&auth_signature=${authSig}`)
    const latency = Date.now() - start

    if (!res.ok) {
      return { name: 'Pusher', status: 'error', detail: `API returned ${res.status}`, lastChecked: 'just now' }
    }

    const data = (await res.json()) as { channels: Record<string, unknown> }
    const channelCount = Object.keys(data.channels).length
    const status: HealthStatus = latency > 500 ? 'warn' : 'ok'

    return {
      name: 'Pusher',
      status,
      latency: fmt(latency),
      detail: `${channelCount} active channel${channelCount !== 1 ? 's' : ''}`,
      lastChecked: 'just now'
    }
  } catch (e) {
    return {
      name: 'Pusher',
      status: 'error',
      detail: e instanceof Error ? e.message : 'Pusher unreachable',
      lastChecked: 'just now'
    }
  }
}

async function checkVercel(): Promise<ServiceHealth> {
  const start = Date.now()
  try {
    // Hit Vercel's status page API
    const res = await fetch('https://www.vercel-status.com/api/v2/status.json', {
      next: { revalidate: 60 }
    })
    const latency = Date.now() - start
    const data = (await res.json()) as { status: { indicator: string; description: string } }

    const indicator = data.status.indicator // 'none' | 'minor' | 'major' | 'critical'
    const status: HealthStatus = indicator === 'none' ? 'ok' : indicator === 'minor' ? 'warn' : 'error'

    return {
      name: 'Vercel Edge',
      status,
      latency: fmt(latency),
      detail: indicator === 'none' ? 'All regions healthy' : data.status.description,
      lastChecked: 'just now'
    }
  } catch (e) {
    return {
      name: 'Vercel Edge',
      status: 'unknown',
      detail: 'Status page unreachable',
      lastChecked: 'just now'
    }
  }
}

/* ── main action ── */

export async function getServiceHealth(): Promise<ServiceHealth[]> {
  // Run all checks concurrently — don't let one slow check block the rest
  const results = await Promise.all([
    checkPostgres().catch(() => ({
      name: 'PostgreSQL / Prisma',
      status: 'unknown' as HealthStatus,
      detail: 'Check threw unexpectedly',
      lastChecked: 'just now'
    })),
    checkStripe().catch(() => ({
      name: 'Stripe Webhooks',
      status: 'unknown' as HealthStatus,
      detail: 'Check threw unexpectedly',
      lastChecked: 'just now'
    })),
    checkResend().catch(() => ({
      name: 'Resend (Email)',
      status: 'unknown' as HealthStatus,
      detail: 'Check threw unexpectedly',
      lastChecked: 'just now'
    })),
    checkPusher().catch(() => ({ name: 'Pusher', status: 'unknown' as HealthStatus, detail: 'Check threw unexpectedly', lastChecked: 'just now' })),
    checkVercel().catch(() => ({
      name: 'Vercel Edge',
      status: 'unknown' as HealthStatus,
      detail: 'Check threw unexpectedly',
      lastChecked: 'just now'
    }))
  ])

  return results
}
