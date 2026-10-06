'use server'

import prisma from 'prisma/client'
import { requireFullAccess } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import { createLog } from '../../log/createLog'

export async function getPendingAdminInvites() {
  const gate = await requireFullAccess()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

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
