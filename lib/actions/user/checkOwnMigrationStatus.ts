'use server'

import prisma from 'prisma/client'
import { AuthFailure, requireAuth } from '../auth/requireAuth'
import { getErrorMessage } from 'app/utils/_error.utils'
import { createLog } from '../log/createLog'

export async function checkOwnMigrationStatus() {
  const gate = await requireAuth()
  if (!gate.ok) return { success: false, error: (gate as AuthFailure).error, data: null }

  try {
    const user = await prisma.user.findUnique({
      where: { id: gate.userId },
      select: { email: true, hasMigrated: true }
    })

    if (!user) return { success: false, error: 'User not found', data: null }

    if (user.hasMigrated) {
      return { success: true, error: null, data: { pending: false } }
    }

    const normalizedEmail = user.email.toLowerCase().trim()

    const mongoUser = await prisma.mongoUser.findUnique({
      where: { email: normalizedEmail },
      select: { email: true }
    })

    return { success: true, error: null, data: { pending: !!mongoUser } }
  } catch (error) {
    await createLog('error', 'Failed to check own migration status', {
      userId: gate.userId,
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to check migration status', data: null }
  }
}
