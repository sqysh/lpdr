import prisma from 'prisma/client'
import { Prisma } from '@prisma/client'

const LOG_LEVELS = { info: 20, warn: 30, error: 40 } as const
type LogLevel = keyof typeof LOG_LEVELS

const MIN_LEVEL =
  LOG_LEVELS[
    (process.env.LOG_LEVEL as LogLevel) ?? (process.env.NODE_ENV === 'production' ? 'info' : 'warn')
  ]

export async function createLog(
  level: LogLevel,
  message: string,
  metadata?: Record<string, unknown>
) {
  if (LOG_LEVELS[level] < MIN_LEVEL) return

  await prisma.log.create({
    data: {
      level,
      message,
      metadata: metadata ? (metadata as Prisma.InputJsonValue) : undefined
    }
  })
}
