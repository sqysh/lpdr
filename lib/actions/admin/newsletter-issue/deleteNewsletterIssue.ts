'use server'

import { revalidatePath } from 'next/cache'
import prisma from 'prisma/client'
import { createLog } from 'lib/actions/log/createLog'
import { AdminFailure, requireAdmin } from '../../auth/requireAdmin'
import { getErrorMessage } from 'app/utils/_error.utils'

export default async function deleteNewsletterIssue(id: string) {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, error: (gate as AdminFailure).error, data: null }

  if (!id) return { success: false, error: 'Missing issue id', data: null }

  try {
    const issue = await prisma.newsletterIssue.delete({
      where: { id },
      select: { id: true, month: true, year: true }
    })

    revalidatePath('/newsletters')
    revalidatePath('/admin/newsletter')

    return { success: true, error: null, data: issue }
  } catch (error) {
    const notFound =
      error instanceof Error && 'code' in error && (error as { code?: string }).code === 'P2025'

    await createLog('error', 'Failed to delete newsletter issue', {
      newsletterIssueId: id,
      error: getErrorMessage(error),
      deletedBy: gate.userId
    })

    return {
      success: false,
      error: notFound
        ? 'That issue no longer exists.'
        : 'Failed to delete newsletter issue. Please try again.',
      data: null
    }
  }
}
