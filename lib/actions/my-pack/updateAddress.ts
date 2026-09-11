'use server'

import prisma from 'prisma/client'
import { createLog } from '../log/createLog'
import { requireAuth } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import { parseInput } from 'lib/utils/validate.utils'
import { addressSchema } from 'lib/schemas/address.schema'
import type { ActionResult } from 'types/action.types'

export const updateAddress = async (input: unknown): Promise<ActionResult<null>> => {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  const parsed = parseInput(addressSchema, input)
  if (parsed.ok === false) return parsed.result

  const data = parsed.data

  try {
    await prisma.address.upsert({
      where: { userId: gate.userId },
      update: data,
      create: { ...data, userId: gate.userId }
    })

    return { success: true, data: null }
  } catch (error) {
    await createLog('error', 'Failed to update address', {
      location: ['updateAddress.ts'],
      userId: gate.userId,
      error: getErrorMessage(error)
    })

    return { success: false, error: 'Failed to update address. Please try again.', data: null }
  }
}
