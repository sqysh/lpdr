'use server'

import prisma from 'prisma/client'
import { createLog } from '../log/createLog'
import { AuthFailure, requireAuth } from '../auth/requireAuth'
import { getErrorMessage } from 'app/utils/_error.utils'

export async function markWelcomeSeen() {
  const gate = await requireAuth()
  if (!gate.ok) return { success: false, error: (gate as AuthFailure).error }

  try {
    await prisma.user.update({
      where: { id: gate.userId },
      data: { hasSeenWelcome: true }
    })
    return { success: true }
  } catch (error) {
    await createLog('error', 'Failed to mark welcome as seen', {
      userId: gate.userId,
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to update' }
  }
}
