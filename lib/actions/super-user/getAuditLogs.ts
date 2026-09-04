'use server'

import prisma from 'prisma/client'
import { requireSuper } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import { createLog } from '../log/createLog'

export interface LogEntry {
  id: string
  ts: string
  level: 'INFO' | 'WARN' | 'ERROR'
  message: string
}

export async function getAuditLogs(limit = 50) {
  const gate = await requireSuper()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  const take = Math.min(Math.max(Math.trunc(limit) || 50, 1), 200)

  try {
    const logs = await prisma.log.findMany({
      where: { message: { startsWith: '[SUPER]' } },
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        level: true,
        message: true,
        createdAt: true
      }
    })

    const data: LogEntry[] = logs.map((log) => ({
      id: log.id,
      ts: log.createdAt.toISOString().replace('T', ' ').slice(0, 19),
      level: log.level.toUpperCase() as LogEntry['level'],
      message: log.message
    }))

    return { success: true, error: null, data }
  } catch (error) {
    await createLog('error', 'Failed to fetch audit logs', { error: getErrorMessage(error) })
    return { success: false, error: 'Failed to fetch audit logs', data: null }
  }
}
