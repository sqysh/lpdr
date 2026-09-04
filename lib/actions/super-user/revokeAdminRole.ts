'use server'

import prisma from 'prisma/client'
import { Role } from '@prisma/client'
import { createLog } from '../log/createLog'
import { requireAdmin } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import type { ActionResult } from 'types/action.types'

export async function revokeAdminRole(userId: string): Promise<ActionResult<null>> {
  const gate = await requireAdmin()
  if (gate.ok === false) {
    await createLog('warn', 'Unauthorized revokeAdminRole attempt', { userId })
    return { success: false, data: null, error: gate.error }
  }

  if (userId === gate.userId) {
    return { success: false, data: null, error: 'You cannot revoke your own role' }
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true }
    })

    if (!existing) return { success: false, data: null, error: 'User not found' }

    if (existing.role === Role.PACK_MEMBER) {
      return {
        success: false,
        data: null,
        error: `${existing.email} doesn't have an admin role to revoke`
      }
    }

    if (existing.role === Role.SUPER_USER) {
      return { success: false, data: null, error: 'Cannot revoke a super user role' }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { role: Role.PACK_MEMBER }
    })

    await createLog('warn', `[ADMIN] ${gate.email} revoked admin role from ${existing.email}`, {
      targetUserId: userId,
      targetEmail: existing.email,
      previousRole: existing.role,
      revokedBy: gate.userId
    })

    return { success: true, data: null }
  } catch (error) {
    await createLog('error', 'Failed to revoke admin role', {
      userId,
      error: getErrorMessage(error)
    })
    return { success: false, data: null, error: 'Failed to revoke role. Please try again.' }
  }
}
