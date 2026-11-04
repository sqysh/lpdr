'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import prisma from 'prisma/client'
import { requireAccess } from 'lib/auth/guards'
import { createLog } from 'lib/actions/log/createLog'
import { parseInput } from 'lib/utils/validate.utils'
import { getErrorMessage, getUserMessage, UserFacingError } from 'lib/utils/error.utils'
import { getMemorialSettings } from 'lib/memorial/getMemorialSetting'
import type { ActionResult } from 'types/action.types'
import { Prisma } from '@prisma/client'

const schema = z.discriminatedUnion('status', [
  z.object({ id: z.string().min(1), status: z.literal('APPROVED') }),
  z.object({ id: z.string().min(1), status: z.literal('PENDING') }),
  z.object({
    id: z.string().min(1),
    status: z.literal('HIDDEN'),
    hiddenReason: z.string().trim().max(300).optional()
  })
])

export async function updateMemorialStatus(input: unknown): Promise<ActionResult<{ id: string }>> {
  const gate = await requireAccess('MONEY')
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  const parsed = parseInput(schema, input)
  if (parsed.ok === false) return parsed.result

  const { id, status } = parsed.data

  try {
    const memorial = await prisma.memorial.findUnique({ where: { id }, select: { id: true } })
    if (!memorial) throw new UserFacingError('That memorial no longer exists.')

    let data: Prisma.MemorialUpdateInput

    if (status === 'APPROVED') {
      // The display window starts when it goes up, not when it was paid for, so a memorial that
      // waited a week in the queue still gets its full time on the page
      const { displayDays } = await getMemorialSettings()
      const approvedAt = new Date()
      data = {
        status,
        approvedAt,
        approvedBy: { connect: { id: gate.userId } },
        hiddenReason: null,
        expiresAt: displayDays ? new Date(approvedAt.getTime() + displayDays * 86_400_000) : null
      }
    } else if (status === 'HIDDEN') {
      data = { status, hiddenReason: parsed.data.hiddenReason || null }
    } else {
      data = { status, approvedAt: null, approvedBy: { disconnect: true }, hiddenReason: null, expiresAt: null }
    }

    await prisma.memorial.update({ where: { id }, data })

    await createLog('info', 'Memorial status updated', { memorialId: id, status, userId: gate.userId })

    revalidatePath('/rainbow-bridge')
    revalidatePath('/admin/memorials')

    return { success: true, data: { id } }
  } catch (error) {
    await createLog('error', 'Failed to update memorial status', { memorialId: id, status, error: getErrorMessage(error) })
    return { success: false, data: null, error: getUserMessage(error, "We couldn't update that memorial. Please try again.") }
  }
}
