'use server'

import prisma from 'prisma/client'
import { Role } from '@prisma/client'
import { createLog } from '../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import type { ActionResult } from 'types/action.types'
import { requireAdmin } from 'lib/auth/guards'

type GrantedUser = {
  id: string
  email: string | null
  firstName: string | null
  lastName: string | null
}

export async function grantAdminRole(email: string, role: 'ADMIN' | 'SUPER_USER'): Promise<ActionResult<GrantedUser>> {
  const gate = await requireAdmin()
  if (gate.ok === false) {
    await createLog('warn', 'Unauthorized grantAdminRole attempt', { email, role })
    return { success: false, data: null, error: gate.error }
  }

  if (role !== Role.ADMIN && role !== Role.SUPER_USER) {
    return { success: false, data: null, error: 'Invalid role' }
  }

  if (role === Role.SUPER_USER && gate.role !== Role.SUPER_USER) {
    await createLog('warn', 'Admin attempted to grant SUPER_USER', {
      email,
      grantedBy: gate.userId
    })
    return { success: false, data: null, error: 'Only a super user can grant that role' }
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true }
    })

    if (!existing) {
      return {
        success: false,
        data: null,
        error: `No user found with email ${email} — they must sign up first before being granted a role`
      }
    }

    if (existing.role === role) {
      return { success: false, data: null, error: `${email} already has the ${role} role` }
    }

    const user = await prisma.user.update({
      where: { email },
      data: { role },
      select: { id: true, email: true, firstName: true, lastName: true }
    })

    await createLog('warn', `[SUPER] ${gate.email} granted ${role} to ${email}`, {
      targetUserId: user.id,
      targetEmail: email,
      previousRole: existing.role,
      role,
      grantedBy: gate.userId
    })

    return { success: true, data: user }
  } catch (error) {
    await createLog('error', 'Failed to grant admin role', {
      email,
      role,
      error: getErrorMessage(error)
    })
    return { success: false, data: null, error: 'Failed to grant role. Please try again.' }
  }
}
