'use server'

import { auth } from 'lib/auth'
import prisma from 'prisma/client'

export interface LogEntry {
  id: string
  ts: string
  level: 'INFO' | 'WARN' | 'ERROR'
  message: string
}

export async function getAuditLogs(
  limit = 50
): Promise<{ success: boolean; data: LogEntry[]; error?: string }> {
  const session = await auth()
  if (session?.user?.role !== 'SUPER_USER') {
    return { success: false, error: 'Unauthorized', data: [] }
  }

  const logs = await prisma.log.findMany({
    where: {
      message: { startsWith: '[SUPER]' }
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      level: true,
      message: true,
      createdAt: true
    }
  })

  return {
    success: true,
    data: logs.map((log) => ({
      id: log.id,
      ts: log.createdAt.toISOString().replace('T', ' ').slice(0, 19),
      level: log.level.toUpperCase() as LogEntry['level'],
      message: log.message
    }))
  }
}
