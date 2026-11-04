'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import prisma from 'prisma/client'
import { requireAccess } from 'lib/auth/guards'
import { parseInput } from 'lib/utils/validate.utils'
import { getErrorMessage, getUserMessage } from 'lib/utils/error.utils'
import type { ActionResult } from 'types/action.types'
import { createLog } from 'lib/actions/log/createLog'

const money = z.number().min(1).max(100_000)

const schema = z
  .object({
    isEnabled: z.boolean(),
    fixedAmount: money.nullable(),
    minAmount: money,
    suggestedAmounts: z.array(money).max(6),
    allowMessage: z.boolean(),
    // Capped at 500 because the message travels in a single Stripe metadata value
    messageMaxLength: z.number().int().min(20).max(500),
    allowPhoto: z.boolean(),
    allowDonorName: z.boolean(),
    requireApproval: z.boolean(),
    displayDays: z.number().int().min(1).max(3650).nullable()
  })
  .refine((s) => s.fixedAmount != null || s.suggestedAmounts.every((a) => a >= s.minAmount), {
    message: 'Every suggested amount needs to be at least the minimum.',
    path: ['suggestedAmounts']
  })

export async function updateMemorialSettings(input: unknown): Promise<ActionResult<{ id: string }>> {
  const gate = await requireAccess('MONEY')
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  const parsed = parseInput(schema, input)
  if (parsed.ok === false) return parsed.result

  const settings = { ...parsed.data, suggestedAmounts: [...new Set(parsed.data.suggestedAmounts)].sort((a, b) => a - b) }

  try {
    await prisma.memorialSettings.upsert({
      where: { id: 'default' },
      update: { ...settings, updatedBy: { connect: { id: gate.userId } } },
      create: { id: 'default', ...settings, updatedBy: { connect: { id: gate.userId } } }
    })

    await createLog('info', 'Memorial settings updated', { userId: gate.userId, ...settings })

    revalidatePath('/rainbow-bridge')
    revalidatePath('/rainbow-bridge/remember')
    revalidatePath('/admin/memorials')
    revalidatePath('/admin/memorials/settings')
    revalidatePath('/', 'layout')

    return { success: true, data: { id: 'default' } }
  } catch (error) {
    await createLog('error', 'Failed to update memorial settings', { error: getErrorMessage(error) })
    return { success: false, data: null, error: getUserMessage(error, "We couldn't save the settings. Please try again.") }
  }
}
