'use server'

import prisma from 'prisma/client'
import { createLog } from 'lib/actions/log/createLog'
import { requireAdmin } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'

export default async function getNewsletterIssues() {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  try {
    const issues = await prisma.newsletterIssue.findMany({
      orderBy: [{ isLive: 'desc' }, { createdAt: 'desc' }]
    })

    return { success: true, error: null, data: issues }
  } catch (error) {
    await createLog('error', 'Failed to fetch newsletter issues', { error: getErrorMessage(error) })

    return {
      success: false,
      error: 'Failed to load newsletter issues. Please try again.',
      data: null
    }
  }
}
