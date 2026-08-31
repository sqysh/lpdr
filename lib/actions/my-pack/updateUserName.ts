'use server'

import prisma from 'prisma/client'
import { createLog } from '../log/createLog'
import { AuthFailure, requireAuth } from '../auth/requireAuth'
import { getErrorMessage } from 'app/utils/_error.utils'

export const updateUserName = async ({ firstName, lastName }: { firstName: string; lastName: string }) => {
  const gate = await requireAuth()
  if (!gate.ok) return { success: false, error: (gate as AuthFailure).error, data: null }

  if (!firstName.trim() || !lastName.trim()) {
    return { success: false, error: 'First and last name are required', data: null }
  }

  try {
    const user = await prisma.user.update({
      where: { id: gate.userId },
      data: { firstName: firstName.trim(), lastName: lastName.trim() },
      select: { id: true, firstName: true, lastName: true }
    })

    return { success: true, data: user, error: null }
  } catch (error) {
    await createLog('error', 'Failed to update user name', {
      userId: gate.userId,
      error: getErrorMessage(error)
    })

    return { success: false, error: 'Failed to update name. Please try again.', data: null }
  }
}
