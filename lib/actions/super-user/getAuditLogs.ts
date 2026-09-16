'use server'

import prisma from 'prisma/client'
import { requireSuper } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import { createLog } from '../log/createLog'

export interface LogEntry {
  id: string
  ts: string
  level: 'WARN' | 'ERROR'
  message: string
  /** The one line from the metadata worth showing inline. The full object lives on the logs page. */
  detail?: string
}

const LOOKBACK_HOURS = 24

/** The message says what failed; the metadata says which one, and that is usually the useful part. */
const summarise = (metadata: unknown): string | undefined => {
  if (!metadata || typeof metadata !== 'object') return undefined

  const m = metadata as Record<string, unknown>

  // Named first so the common cases read well, then anything else that looks like an id.
  const candidates = [m.detail, m.error, m.email, m.auctionTitle, m.itemName, m.orderId, m.auctionId, m.winningBidderId]

  const found = candidates.find((v) => typeof v === 'string' && v.length > 0)

  return typeof found === 'string' ? found : undefined
}

export async function getAuditLogs(limit = 50) {
  const gate = await requireSuper()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  const take = Math.min(Math.max(Math.trunc(limit) || 50, 1), 200)

  try {
    // Only things that went wrong. The info stream is the logs page; this panel is for the
    // question "is anything broken right now", so anything routine would bury the answer.
    const logs = await prisma.log.findMany({
      where: {
        level: { in: ['error', 'warn'] },
        createdAt: { gte: new Date(Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000) }
      },
      orderBy: { createdAt: 'desc' },
      take,
      select: { id: true, level: true, message: true, metadata: true, createdAt: true }
    })

    const data: LogEntry[] = logs.map((log) => ({
      id: log.id,
      ts: log.createdAt.toISOString().replace('T', ' ').slice(0, 19),
      level: log.level.toUpperCase() as LogEntry['level'],
      message: log.message,
      detail: summarise(log.metadata)
    }))

    return { success: true, error: null, data }
  } catch (error) {
    await createLog('error', 'Failed to fetch audit logs', { error: getErrorMessage(error) })
    return { success: false, error: 'Failed to fetch audit logs', data: null }
  }
}
