'use server'

import prisma from 'prisma/client'
import { requireSuper } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import { createLog } from '../log/createLog'

export interface PusherEvent {
  id: string
  ts: string
  channel: string
  event: string
  payload: Record<string, unknown>
}

export async function getPusherEvents(limit = 50) {
  const gate = await requireSuper()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  const take = Math.min(Math.max(Math.trunc(limit) || 50, 1), 200)

  try {
    const logs = await prisma.log.findMany({
      where: { message: '[PUSHER]' },
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        createdAt: true,
        metadata: true
      }
    })

    const data: PusherEvent[] = logs.map((log) => {
      const meta = (log.metadata ?? {}) as Partial<{
        channel: string
        event: string
        payload: Record<string, unknown>
      }>

      return {
        id: log.id,
        ts: log.createdAt.toISOString().replace('T', ' ').slice(0, 19),
        channel: meta.channel ?? 'unknown',
        event: meta.event ?? 'unknown',
        payload: meta.payload ?? {}
      }
    })

    return { success: true, error: null, data }
  } catch (error) {
    await createLog('error', 'Failed to fetch pusher events', { error: getErrorMessage(error) })
    return { success: false, error: 'Failed to fetch pusher events', data: null }
  }
}
