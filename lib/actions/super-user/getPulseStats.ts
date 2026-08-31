'use server'

import prisma from 'prisma/client'
import { getServiceHealth } from './getServiceHealth'

export interface PulseStat {
  label: string
  value: number
  signal: 'green' | 'yellow' | 'red' | 'neutral'
  detail: string
}

export async function getPulseStats(): Promise<PulseStat[]> {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const [cronErrors, emailBounces, webhookFailures, services] = await Promise.all([
    // Cron errors — logs with [CRON] prefix and error level in last 24h
    prisma.log.findMany({
      where: {
        level: 'error',
        message: { startsWith: '[CRON]' },
        createdAt: { gte: since24h }
      },
      select: { message: true, metadata: true }
    }),

    // Email bounces — Resend fires a webhook on bounce, which you'd log
    // If you're not logging bounces yet this will always return 0
    prisma.log.count({
      where: {
        level: 'error',
        message: { contains: 'email' },
        createdAt: { gte: since24h }
      }
    }),

    // Stripe webhook failures — payment_intent.payment_failed logs
    prisma.log.findMany({
      where: {
        level: 'error',
        message: { contains: 'webhook' },
        createdAt: { gte: since24h }
      },
      select: { message: true, metadata: true }
    }),

    // Reuse getServiceHealth — already written, don't duplicate
    getServiceHealth()
  ])

  // Cron signal
  const cronErrorCount = cronErrors.length
  const cronDetail =
    cronErrorCount === 0
      ? 'All crons healthy'
      : cronErrors
          .map((l) => (l.metadata as { cronName?: string } | null)?.cronName)
          .filter(Boolean)
          .join(', ')

  // Email signal
  const emailDetail = emailBounces === 0 ? 'All deliveries succeeded' : `${emailBounces} failed send(s) in last 24h`

  // Webhook signal
  const webhookCount = webhookFailures.length
  const webhookDetail =
    webhookCount === 0
      ? 'All Stripe events processed'
      : webhookFailures
          .map((l) => (l.metadata as { error?: string } | null)?.error)
          .filter(Boolean)
          .join(', ')

  // Service warnings — reuse getServiceHealth results
  const serviceWarnings = services.filter((s) => s.status === 'warn' || s.status === 'error')
  const serviceDetail = serviceWarnings.length === 0 ? 'All services healthy' : serviceWarnings.map((s) => s.name).join(', ')

  return [
    {
      label: 'Cron Errors (24h)',
      value: cronErrorCount,
      signal: cronErrorCount === 0 ? 'green' : 'red',
      detail: cronDetail
    },
    {
      label: 'Email Failures (24h)',
      value: emailBounces,
      signal: emailBounces === 0 ? 'green' : emailBounces < 3 ? 'yellow' : 'red',
      detail: emailDetail
    },
    {
      label: 'Webhook Failures (24h)',
      value: webhookCount,
      signal: webhookCount === 0 ? 'green' : 'red',
      detail: webhookDetail
    },
    {
      label: 'Service Warnings',
      value: serviceWarnings.length,
      signal: serviceWarnings.length === 0 ? 'green' : serviceWarnings.some((s) => s.status === 'error') ? 'red' : 'yellow',
      detail: serviceDetail
    }
  ]
}
