import 'server-only'
import { ActionResult } from 'types/_action.types'
import { z, type ZodType } from 'zod'

export function parseInput<T>(
  schema: ZodType<T>,
  input: unknown
): { ok: true; data: T } | { ok: false; result: ActionResult<never> } {
  const parsed = schema.safeParse(input)
  if (parsed.success) return { ok: true, data: parsed.data }

  const { fieldErrors } = z.flattenError(parsed.error)

  return {
    ok: false,
    result: {
      success: false,
      data: null,
      error: 'Please check the highlighted fields.',
      fieldErrors: fieldErrors as Record<string, string[]>
    }
  }
}
