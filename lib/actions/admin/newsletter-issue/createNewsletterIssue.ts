'use server'

import { revalidatePath } from 'next/cache'
import prisma from 'prisma/client'
import { createLog } from 'lib/actions/log/createLog'
import { MONTHS } from 'lib/constants/date.constants'
import { CreateNewsletterIssueInput } from 'types/_newsletter-issue.types'
import { requireAdmin } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import { YEAR_REGEX } from 'lib/constants/regex.constants'

export default async function createNewsletterIssue(input: CreateNewsletterIssueInput) {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  const month = input.month?.trim()
  const year = input.year?.trim()
  const pdfUrl = input.pdfUrl?.trim()

  if (!month || !MONTHS.includes(month as (typeof MONTHS)[number])) {
    return { success: false, error: 'A valid month is required', data: null }
  }
  if (!year || YEAR_REGEX.test(year)) {
    return { success: false, error: 'A valid four-digit year is required', data: null }
  }
  if (!pdfUrl) {
    return { success: false, error: 'A PDF URL is required', data: null }
  }

  const isLive = input.isLive ?? false

  try {
    await prisma.newsletterIssue.create({
      data: { month, year, pdfUrl, isLive }
    })

    revalidatePath('/newsletters')
    revalidatePath('/admin/newsletter')

    return { success: true, error: null, data: null }
  } catch (error) {
    await createLog('error', 'Failed to create newsletter issue', {
      error: getErrorMessage(error),
      month,
      year,
      createdBy: gate.userId
    })
    return {
      success: false,
      error: 'Failed to create newsletter issue. Please try again.',
      data: null
    }
  }
}
