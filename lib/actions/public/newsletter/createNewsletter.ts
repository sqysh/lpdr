'use server'

import prisma from 'prisma/client'
import { Prisma } from '@prisma/client'
import { headers } from 'next/headers'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { HOUR_MS, isRateLimited } from 'lib/utils/rate-limit.utils'
import { looksAutomated } from 'lib/utils/looksAutomated.utils'
import { parseInput } from 'lib/utils/validate.utils'
import { newsletterSchema } from 'lib/schemas/newsletter.schema'
import type { ActionResult } from 'types/action.types'

export default async function createNewsletter(input: unknown): Promise<ActionResult<null>> {
  const headerList = await headers()
  const ip = headerList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  if (isRateLimited(`newsletter:${ip}`, 5, HOUR_MS)) {
    return { success: false, error: 'Too many attempts. Please try again later.', data: null }
  }

  const parsed = parseInput(newsletterSchema, input)
  if (parsed.ok === false) return parsed.result

  const { email, website, renderedAt } = parsed.data

  // Timing check skipped: a single field form can legitimately be filled by a
  // paste in under three seconds
  const reason = looksAutomated({ website, renderedAt }, null)

  if (reason) {
    await createLog('info', 'Automated newsletter signup ignored', {
      location: ['createNewsletter.ts'],
      reason,
      email,
      ip
    })

    // Success shape, so the bot learns nothing and keeps posting into the void
    return { success: true, data: null }
  }

  try {
    await prisma.newsletter.create({ data: { newsletterEmail: email } })

    return { success: true, data: null }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, error: 'This email is already subscribed', data: null }
    }

    await createLog('error', 'Failed to create newsletter subscription', {
      location: ['createNewsletter.ts'],
      email,
      error: getErrorMessage(error)
    })

    return { success: false, error: 'Something went wrong. Please try again.', data: null }
  }
}
