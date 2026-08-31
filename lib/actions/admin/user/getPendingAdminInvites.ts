'use server'

import prisma from 'prisma/client'
import { AdminFailure, requireAdmin } from '../../auth/requireAdmin'
import { getErrorMessage } from 'app/utils/_error.utils'
import { createLog } from '../../log/createLog'

export async function getPendingAdminInvites() {
  const gate = await requireAdmin()
  if (!gate.ok) return { success: false, error: (gate as AdminFailure).error, data: null }

  try {
    const invites = await prisma.pendingAdminInvite.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return { success: true, data: invites, error: null }
  } catch (error) {
    await createLog('error', 'Failed to get pending admin invites', {
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to load pending invites', data: null }
  }
}
