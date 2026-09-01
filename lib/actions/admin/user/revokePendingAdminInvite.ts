'use server'

import prisma from 'prisma/client'
import { requireAdmin } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import { createLog } from '../../log/createLog'

export async function revokePendingAdminInvite(email: string) {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  try {
    await prisma.pendingAdminInvite.delete({ where: { email } })

    await createLog('info', 'Pending admin invite revoked', {
      email,
      revokedBy: gate.userId
    })

    return { success: true, error: null }
  } catch (error) {
    await createLog('error', 'Failed to revoke pending admin invite', {
      email,
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to revoke invite', data: null }
  }
}
