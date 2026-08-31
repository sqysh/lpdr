'use server'

import { LEVELS } from 'lib/constants/log.constants'
import prisma from 'prisma/client'
import { requireSuper } from '../auth/requireSuper'

export type LogRow = {
  id: string
  level: string
  message: string
  metadata: Record<string, unknown> | null
  userId: string | null
  createdAt: string
}

export type FetchLogsResult =
  | { success: true; data: LogRow[]; total: number; error?: string | null }
  | { success: false; error: string }

type Level = (typeof LEVELS)[number]

const PAGE_SIZE = 100

export async function fetchLogs({
  level,
  search,
  page = 0
}: {
  level?: Level
  search?: string
  page?: number
}): Promise<FetchLogsResult> {
  await requireSuper()

  try {
    const where = {
      ...(level ? { level } : {}),
      ...(search
        ? {
            OR: [
              { message: { contains: search, mode: 'insensitive' as const } },
              { userId: { contains: search, mode: 'insensitive' as const } }
            ]
          }
        : {})
    }

    const [rows, total] = await Promise.all([
      prisma.log.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: PAGE_SIZE,
        skip: page * PAGE_SIZE
      }),
      prisma.log.count({ where })
    ])

    return {
      success: true,
      total,
      data: rows.map((r) => ({
        id: r.id,
        level: r.level,
        message: r.message,
        metadata: r.metadata as Record<string, unknown> | null,
        userId: r.userId,
        createdAt: r.createdAt.toISOString()
      }))
    }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}
