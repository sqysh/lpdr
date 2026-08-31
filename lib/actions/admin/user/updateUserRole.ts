'use server'

import { revalidatePath } from 'next/cache'
import { Role } from '@prisma/client'
import prisma from 'prisma/client'
import { getErrorMessage } from 'app/utils/_error.utils'
import { AdminFailure, requireAdmin } from '../../auth/requireAdmin'
import { createLog } from '../../log/createLog'

const ASSIGNABLE_ROLES: Role[] = ['ADMIN', 'PACK_MEMBER']

export async function updateUserRole(userId: string, role: Role) {
  const gate = await requireAdmin()
  if (!gate.ok) return { success: false, error: (gate as AdminFailure).error, data: null }

  if (!ASSIGNABLE_ROLES.includes(role)) {
    return { success: false, error: 'Invalid role', data: null }
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, role: true }
    })

    await createLog('info', 'User role updated', {
      userId,
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
