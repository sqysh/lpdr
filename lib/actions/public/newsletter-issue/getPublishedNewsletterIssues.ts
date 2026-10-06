'use server'

import prisma from 'prisma/client'
import { createLog } from 'lib/actions/log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'

// Public: anyone can read these, so it only ever returns issues marked live, never drafts
export default async function getPublishedNewsletterIssues() {
  try {
    const issues = await prisma.newsletterIssue.findMany({
      where: { isLive: true },
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, error: null, data: issues }
  } catch (error) {
    await createLog('error', 'Failed to fetch published newsletter issues', { error: getErrorMessage(error) })
    return { success: false, error: 'Failed to load newsletters. Please try again.', data: null }
  }
}
