'use server'

import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { requireAdmin } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import { EMAIL_REGEX } from 'lib/constants/regex.constants'
import { promoteUserToAdmin } from './promoteUserToAdmin'
import { preProvisionAdminUser } from './preProvisionAdminUser'

export async function grantAdminAccess({ email }: { email: string }) {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  const normalizedEmail = email.toLowerCase().trim()

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return { success: false, error: 'Please enter a valid email address', data: null }
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })

    if (existingUser) {
      if (existingUser.role === 'ADMIN' || existingUser.role === 'SUPER_USER') {
        return { success: false, error: 'This user is already an admin', data: null }
      }

      const updated = await promoteUserToAdmin(existingUser.id, gate.userId)
      return { success: true, data: { ...updated, isPending: false }, error: null }
    }

    const invite = await preProvisionAdminUser(normalizedEmail, gate.userId)
    return {
      success: true,
      data: { id: invite.id, email: invite.email, role: invite.role, isPending: true },
      error: null
    }
  } catch (error) {
    await createLog('error', 'Failed to grant admin access', {
      email: normalizedEmail,
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to set up admin access. Please try again.', data: null }
  }
}
