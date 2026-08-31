'use server'

import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { SuperFailure, requireSuper } from '../../auth/requireSuper'
import { getErrorMessage } from 'app/utils/_error.utils'

export default async function getLogs() {
  const gate = await requireSuper()
  if (!gate.ok) return { success: false, error: (gate as SuperFailure).error, data: null }

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
