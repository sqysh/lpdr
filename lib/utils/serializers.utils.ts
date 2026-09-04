import { Prisma } from '@prisma/client'
import { DecimalToNumber } from 'types/prisma.types'

/**
 * Walks any Prisma result and turns every Decimal into a number so it can
 * cross to the client. Handles nested relations and arrays; leaves Dates alone.
 */
export function serialize<T>(value: T): DecimalToNumber<T> {
  if (value == null) return value as never
  if (value instanceof Prisma.Decimal) return Number(value) as never
  if (value instanceof Date) return value as never
  if (Array.isArray(value)) return value.map(serialize) as never

  if (typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, serialize(v)])) as never
  }

  return value as never
}
