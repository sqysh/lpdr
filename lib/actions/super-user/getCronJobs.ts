'use server'

import { requireSuper } from 'lib/auth/guards'
import { formatLastRan, formatNextRun } from 'lib/utils/time.utils'
import prisma from 'prisma/client'
import { createLog } from '../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'

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

export async function getCronJobs() {
  const gate = await requireSuper()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  try {
    const logs = await prisma.log.findMany({
      where: { message: { startsWith: '[CRON]' } },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    const latest = new Map<string, (typeof logs)[number]>()
    for (const log of logs) {
      const meta = log.metadata as { cronName?: string } | null
      const name = meta?.cronName
      if (name && !latest.has(name)) {
        latest.set(name, log)
      }
    }

    const data: CronJob[] = Object.entries(CRON_DEFINITIONS).map(([name, def]) => {
      const log = latest.get(name)
      const meta = log?.metadata as {
        status?: CronStatus
        durationMs?: number
        detail?: string
      } | null

      return {
        id: `cron_${name}`,
        name,
        schedule: def.schedule,
        enabled: def.enabled,
        lastRan: formatLastRan(log ? log.createdAt : null),
        nextRun: formatNextRun(getNextRun(def.schedule)),
        lastStatus: meta?.status ?? 'never',
        durationMs: meta?.durationMs ?? null,
        detail: meta?.detail ?? null
      }
    })

    return { success: true, error: null, data }
  } catch (error) {
    await createLog('error', 'Failed to fetch cron jobs', { error: getErrorMessage(error) })
    return { success: false, error: 'Failed to fetch cron jobs', data: null }
  }
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
