'use server'

import prisma from 'prisma/client'
import { createLog } from 'lib/actions/log/createLog'

export default async function getNewsletterIssues() {
  try {
    const issues = await prisma.newsletterIssue.findMany({
      orderBy: [{ isLive: 'desc' }, { createdAt: 'desc' }]
    })

    return { success: true, error: null, data: issues }
  } catch (error) {
    await createLog('error', 'Failed to fetch newsletter issues', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return {
      success: false,
      error: 'Failed to load newsletter issues. Please try again.',
      data: null
    }
  }
}
