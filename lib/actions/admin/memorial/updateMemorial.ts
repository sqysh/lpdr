'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import prisma from 'prisma/client'
import { requireAccess } from 'lib/auth/guards'
import { createLog } from 'lib/actions/log/createLog'
import { parseInput } from 'lib/utils/validate.utils'
import { getErrorMessage, getUserMessage, UserFacingError } from 'lib/utils/error.utils'
import type { ActionResult } from 'types/action.types'

// Lets an admin fix a typo in the name or take down a photo without hiding the whole memorial
const schema = z.object({
  id: z.string().min(1),
  dogName: z.string().trim().min(1, "Please enter the dog's name").max(60),
  message: z.string().trim().max(500).nullable(),
  donorDisplayName: z.string().trim().max(80).nullable(),
  showDonorName: z.boolean(),
  removePhoto: z.boolean().default(false)
})

export async function updateMemorial(input: unknown): Promise<ActionResult<{ id: string }>> {
  const gate = await requireAccess('MONEY')
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  const parsed = parseInput(schema, input)
  if (parsed.ok === false) return parsed.result

  const { id, dogName, message, donorDisplayName, showDonorName, removePhoto } = parsed.data

  try {
    const exists = await prisma.memorial.findUnique({ where: { id }, select: { id: true } })
    if (!exists) throw new UserFacingError('That memorial no longer exists.')

    await prisma.memorial.update({
      where: { id },
      data: {
        dogName,
        message: message || null,
        donorDisplayName: donorDisplayName || null,
        showDonorName: showDonorName && !!donorDisplayName,
        ...(removePhoto && { photoUrl: null })
      }
    })

    await createLog('info', 'Memorial edited', { memorialId: id, removePhoto, userId: gate.userId })

    revalidatePath('/rainbow-bridge')
    revalidatePath('/admin/memorials')

    return { success: true, data: { id } }
  } catch (error) {
    await createLog('error', 'Failed to edit memorial', { memorialId: id, error: getErrorMessage(error) })
    return { success: false, data: null, error: getUserMessage(error, "We couldn't save those changes. Please try again.") }
  }
}
