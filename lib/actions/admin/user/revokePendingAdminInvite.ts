'use server'

import prisma from 'prisma/client'
import { requireAdmin } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import { createLog } from '../../log/createLog'

export async function revokePendingAdminInvite(email: string) {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  const normalizedEmail = email.toLowerCase().trim()

  try {
    const deleted = await prisma.pendingAdminInvite.deleteMany({ where: { email: normalizedEmail } })

    if (deleted.count === 0) {
      return { success: false, error: 'No pending invite found for that email', data: null }
    }

    await createLog('info', 'Pending admin invite revoked', {
      email: normalizedEmail,
      revokedBy: gate.userId
    })

    return { success: true, error: null, data: null }
  } catch (error) {
    await createLog('error', 'Failed to revoke pending admin invite', {
      email: normalizedEmail,
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to revoke invite', data: null }
  }
}
