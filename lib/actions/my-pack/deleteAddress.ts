'use server'

import prisma from 'prisma/client'
import { createLog } from '../log/createLog'
import { requireAuth } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import type { ActionResult } from 'types/action.types'

export const deleteAddress = async (): Promise<ActionResult<null>> => {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  try {
    // deleteMany so removing an address that's already gone (a double tap, two tabs) isn't an error.
    // Past orders keep their own copy of the address, so they're unaffected.
    await prisma.address.deleteMany({ where: { userId: gate.userId } })

    return { success: true, data: null }
  } catch (error) {
    await createLog('error', 'Failed to delete address', {
      location: ['deleteAddress.ts'],
      userId: gate.userId,
      error: getErrorMessage(error)
    })

    return { success: false, error: 'Failed to remove address. Please try again.', data: null }
  }
}
