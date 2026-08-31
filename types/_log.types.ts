import { JsonValue } from '@prisma/client/runtime/client'
import { LEVELS } from 'app/lib/constants/log.constants'

export type Log = {
  id: string
  level: string
  message: string
  metadata: JsonValue
  userId: string | null
  createdAt: Date
  updatedAt: Date
}

export type LogRow = {
  id: string
  level: string
  message: string
  metadata: Record<string, unknown> | null
  userId: string | null
  createdAt: string
}

export type Level = (typeof LEVELS)[number]
