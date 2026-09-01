'use server'

import prisma from 'prisma/client'
import { createLog } from '../log/createLog'
import { requireAuth } from 'lib/auth/guards'
import { getErrorMessage } from 'app/utils/_error.utils'

export const getUserName = async () => {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  try {
    const user = await prisma.user.findUnique({
      where: { id: gate.userId },
      select: { firstName: true, lastName: true }
    })

    return { success: true, data: user, error: null }
  } catch (error) {
    await createLog('error', 'Failed to get user name', {
      userId: gate.userId,
      error: getErrorMessage(error)
    })

    return { success: false, error: 'Failed to get user name. Please try again.', data: null }
  }
}
