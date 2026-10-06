'use server'

import { z } from 'zod'
import { AdminArea } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import prisma from 'prisma/client'
import { requireSuper } from 'lib/auth/guards'
import { createLog } from 'lib/actions/log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { parseInput } from 'lib/utils/validate.utils'
import type { ActionResult } from 'types/action.types'

const schema = z.object({
  userId: z.string().min(1),
  areas: z.array(z.enum(AdminArea))
})

export async function updateAdminAreas(input: unknown): Promise<ActionResult<null>> {
  const gate = await requireSuper()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  const parsed = parseInput(schema, input)
  if (parsed.ok === false) return parsed.result
  const { userId, areas } = parsed.data

  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, adminAreas: true } })
    if (!user) return { success: false, data: null, error: 'User not found' }
    if (user.role !== 'ADMIN') return { success: false, data: null, error: 'Areas only apply to admins.' }

    await prisma.user.update({ where: { id: userId }, data: { adminAreas: [...new Set(areas)] } })

    // Kept in the log so there's a record of who changed someone's access, and from what
    await createLog('info', 'Admin areas updated', { userId, from: user.adminAreas, to: areas, changedBy: gate.userId })

    revalidatePath(`/admin/users/${userId}`)
    return { success: true, data: null }
  } catch (error) {
    await createLog('error', 'Failed to update admin areas', { userId, error: getErrorMessage(error) })
    return { success: false, data: null, error: 'Could not save access. Please try again.' }
  }
}
