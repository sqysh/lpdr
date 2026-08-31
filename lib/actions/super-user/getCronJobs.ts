'use server'

import { formatLastRan, formatNextRun } from 'app/utils/_time.utils'
import prisma from 'prisma/client'

export type CronStatus = 'success' | 'error' | 'skipped' | 'never'

export interface CronJob {
  id: string
  name: string
  schedule: string
  lastRan: string | null
  lastStatus: CronStatus
  nextRun: string
  enabled: boolean
  durationMs: number | null
  detail: string | null
}

// Cron definitions live here — schedule + enabled are config not DB state
const CRON_DEFINITIONS: Record<string, { schedule: string; enabled: boolean }> = {
  'auction-updated': { schedule: '*/2 * * * *', enabled: true },
  'end-auction': { schedule: '*/5 * * * *', enabled: true },
  'expire-adoption-fees': { schedule: '0 0 * * *', enabled: true },
  'rotate-bypass-code': { schedule: '0 0 * * 0', enabled: true },
  'start-auction': { schedule: '0 * * * *', enabled: true },
  'winner-payment-reminder': { schedule: '0 12 * * *', enabled: true }
}

export async function getCronJobs(): Promise<CronJob[]> {
  // Get the most recent log entry per cron name in one query
  const logs = await prisma.log.findMany({
    where: {
      message: { startsWith: '[CRON]' }
    },
    orderBy: { createdAt: 'desc' },
    // Grab enough rows to ensure we get at least one per cron
    take: 50
  })

  // Dedupe to most recent per cron name
  const latest = new Map<string, (typeof logs)[number]>()
  for (const log of logs) {
    const meta = log.metadata as { cronName?: string; status?: string; durationMs?: number; detail?: string } | null
    const name = meta?.cronName
    if (name && !latest.has(name)) {
      latest.set(name, log)
    }
  }

  return Object.entries(CRON_DEFINITIONS).map(([name, def]) => {
    const log = latest.get(name)
    const meta = log?.metadata as { status?: CronStatus; durationMs?: number; detail?: string } | null

    return {
      id: `cron_${name}`,
      name,
      schedule: def.schedule,
      enabled: def.enabled,
      lastRan: formatLastRan(log ? log.createdAt : null),
      nextRun: formatNextRun(getNextRun(def.schedule)),
      lastStatus: meta?.status ?? ('never' as CronStatus),
      durationMs: meta?.durationMs ?? null,
      detail: meta?.detail ?? null
    }
  })
}

// Naive next-run calculator — good enough for display
// If you want precision, add the `cronstrue` or `cron-parser` package
function getNextRun(schedule: string): string {
  const parts = schedule.split(' ')
  const [minute, hour] = parts

  const now = new Date()
  const next = new Date(now)
  next.setSeconds(0, 0)

  if (schedule === '*/2 * * * *') {
    const rem = now.getMinutes() % 2
    next.setMinutes(now.getMinutes() + (rem === 0 ? 2 : 2 - rem))
  } else if (schedule === '*/5 * * * *') {
    const rem = now.getMinutes() % 5
    next.setMinutes(now.getMinutes() + (rem === 0 ? 5 : 5 - rem))
  } else if (minute === '0' && hour === '*') {
    // every hour on the hour
    next.setHours(now.getHours() + 1, 0)
  } else if (minute === '0' && hour !== '*') {
    // daily at specific hour
    const h = parseInt(hour)
    next.setHours(h, 0)
    if (next <= now) next.setDate(next.getDate() + 1)
  } else if (schedule === '0 0 * * 0') {
    // weekly sunday midnight
    const daysUntilSunday = (7 - now.getDay()) % 7 || 7
    next.setDate(now.getDate() + daysUntilSunday)
    next.setHours(0, 0)
  } else {
    next.setMinutes(now.getMinutes() + 60)
  }

  return next.toISOString()
}
