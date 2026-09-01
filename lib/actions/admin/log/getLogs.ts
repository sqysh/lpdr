'use server'

import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { requireSuper } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'

export default async function getLogs() {
  const gate = await requireSuper()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  try {
    const logs = await prisma.log.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, data: logs, error: null }
  } catch (error) {
    await createLog('error', 'Failed to get logs', {
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to get logs', data: null }
  }
}
