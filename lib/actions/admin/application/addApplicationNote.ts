'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import prisma from 'prisma/client'
import { requireAccess } from 'lib/auth/guards'
import { createLog } from 'lib/actions/log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { parseInput } from 'lib/utils/validate.utils'
import type { ActionResult } from 'types/action.types'

const schema = z.object({
  applicationId: z.string().min(1),
  body: z.string().trim().min(1, 'Write a note first').max(5000)
})

export async function addApplicationNote(input: unknown): Promise<ActionResult<null>> {
  const gate = await requireAccess('APPLICATIONS')
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  const parsed = parseInput(schema, input)
  if (parsed.ok === false) return parsed.result
  const { applicationId, body } = parsed.data

  try {
    await prisma.$transaction([
      prisma.applicationEvent.create({ data: { applicationId, kind: 'NOTE', actorId: gate.userId, body } }),
      // A note counts as activity, so the list stops flagging it as gone quiet
      prisma.application.update({ where: { id: applicationId }, data: { updatedAt: new Date() } })
    ])
    revalidatePath('/admin/applications')
    revalidatePath(`/admin/applications/${applicationId}`)
    return { success: true, data: null }
  } catch (error) {
    await createLog('error', 'Failed to add application note', { applicationId, error: getErrorMessage(error) })
    return { success: false, data: null, error: 'Could not save the note. Please try again.' }
  }
}
