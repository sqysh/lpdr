'use server'

import { revalidatePath } from 'next/cache'
import { Role } from '@prisma/client'
import prisma from 'prisma/client'
import { getErrorMessage } from 'lib/utils/error.utils'
import { requireFullAccess } from 'lib/auth/guards'
import { createLog } from '../../log/createLog'

const ASSIGNABLE_ROLES: Role[] = ['ADMIN', 'PACK_MEMBER']

export async function updateUserRole(userId: string, role: Role) {
  const gate = await requireFullAccess()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  if (!ASSIGNABLE_ROLES.includes(role)) {
    return { success: false, error: 'Invalid role', data: null }
  }

  // Changing your own role could lock you out of the admin with no way back
  if (userId === gate.userId) {
    return { success: false, error: "You can't change your own role. Ask another full-access admin.", data: null }
  }

  try {
    const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } })
    if (!target) return { success: false, error: 'User not found', data: null }

    // Super users are only changed by super users, never by an admin, however much access they have
    if (target.role === 'SUPER_USER' && gate.role !== 'SUPER_USER') {
      return { success: false, error: 'Only a super user can change a super user.', data: null }
    }

    // Same role again is a no-op. Without this, re-saving an admin as Admin would wipe their areas below
    if (target.role === role) {
      return { success: true, error: null, data: { id: target.id, role: target.role } }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      // A new admin starts with no areas until someone ticks them. Leaving admin clears them,
      // so becoming an admin again later doesn't quietly restore old access
      data: { role, adminAreas: [] },
      select: { id: true, role: true }
    })

    await createLog('info', 'User role updated', {
      userId,
      fromRole: target.role,
      newRole: role,
      updatedBy: gate.userId
    })

    revalidatePath(`/admin/users/${userId}`)
    revalidatePath('/admin/users')

    return { success: true, error: null, data: updated }
  } catch (error) {
    await createLog('error', 'Failed to update user role', {
      error: getErrorMessage(error),
      userId,
      attemptedRole: role
    })

    return { success: false, error: 'Failed to update role. Please try again.', data: null }
  }
}
