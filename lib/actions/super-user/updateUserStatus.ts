'use server'

import prisma from 'prisma/client'
import { Role, UserStatus } from '@prisma/client'
import { createLog } from '../log/createLog'
import { requireSuper } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import type { ActionResult } from 'types/_action.types'

export async function updateUserStatus(userId: string, status: UserStatus, reason?: string): Promise<ActionResult<null>> {
  const gate = await requireSuper()
  if (gate.ok === false) {
    await createLog('warn', 'Unauthorized updateUserStatus attempt', { userId, status })
    return { success: false, data: null, error: gate.error }
  }

  if (!Object.values(UserStatus).includes(status)) {
    return { success: false, data: null, error: 'Invalid status' }
  }

  if (userId === gate.userId) {
    return { success: false, data: null, error: 'You cannot change your own status' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, status: true, role: true }
    })

    if (!user) return { success: false, data: null, error: 'User not found' }

    if (user.status === status) {
      return { success: false, data: null, error: `User is already ${status.toLowerCase()}` }
    }

    if (user.role === Role.SUPER_USER) {
      return { success: false, data: null, error: 'Cannot modify a super user status' }
    }

    if (user.status === 'TERMINATED' && status === 'SUSPENDED') {
      return {
        success: false,
        data: null,
        error: 'Cannot suspend a terminated user — reinstate first'
      }
    }

    await prisma.user.update({ where: { id: userId }, data: { status } })

    await createLog(status === 'ACTIVE' ? 'info' : 'warn', `[SUPER] ${gate.email} set ${user.email} to ${status}`, {
      targetUserId: userId,
      targetEmail: user.email,
      previousStatus: user.status,
      newStatus: status,
      reason: reason ?? null,
      actor: gate.userId
    })

    return { success: true, data: null }
  } catch (error) {
    await createLog('error', 'Failed to update user status', {
      userId,
      status,
      error: getErrorMessage(error)
    })
    return { success: false, data: null, error: 'Failed to update status. Please try again.' }
  }
}
