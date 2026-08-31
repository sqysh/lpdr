'use server'

import prisma from 'prisma/client'

export interface PusherEvent {
  id: string
  ts: string
  channel: string
  event: string
  payload: Record<string, unknown>
}

export async function getPusherEvents(limit = 50): Promise<PusherEvent[]> {
  const logs = await prisma.log.findMany({
    where: {
      message: '[PUSHER]'
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      createdAt: true,
      metadata: true
    }
  })

  return logs.map((log) => {
    const meta = log.metadata as {
      channel: string
      event: string
      payload: Record<string, unknown>
    }
    return {
      id: log.id,
      ts: log.createdAt.toISOString().replace('T', ' ').slice(0, 19),
      channel: meta.channel,
      event: meta.event,
      payload: meta.payload
    }
  })
}
