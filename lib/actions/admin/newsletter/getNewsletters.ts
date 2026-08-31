'use server'

import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { AdminFailure, requireAdmin } from '../../auth/requireAdmin'
import { getErrorMessage } from 'app/utils/_error.utils'

export default async function getNewsletters() {
  const gate = await requireAdmin()
  if (!gate.ok) return { success: false, error: (gate as AdminFailure).error, data: null }

  try {
    const newsletters = await prisma.newsletter.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, data: newsletters, error: null }
  } catch (error) {
    await createLog('error', 'Failed to get newsletters', {
      error: getErrorMessage(error)
    })

    return { success: false, error: 'Failed to get newsletters. Please try again.', data: null }
  }
}
