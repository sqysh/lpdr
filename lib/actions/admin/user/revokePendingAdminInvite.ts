'use server'

import prisma from 'prisma/client'
import { AdminFailure, requireAdmin } from '../../auth/requireAdmin'
import { getErrorMessage } from 'app/utils/_error.utils'
import { createLog } from '../../log/createLog'

export async function revokePendingAdminInvite(email: string) {
  const gate = await requireAdmin()
  if (!gate.ok) return { success: false, error: (gate as AdminFailure).error, data: null }

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
