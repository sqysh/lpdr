'use server'

import prisma from 'prisma/client'
import { Prisma } from '@prisma/client'
import { headers } from 'next/headers'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { EMAIL_REGEX } from 'lib/constants/regex.constants'
import { HOUR_MS, isRateLimited } from 'lib/utils/rate-limit.utils'

export default async function createNewsletter(email: string) {
  const headerList = await headers()
  const ip = headerList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  if (isRateLimited(`newsletter:${ip}`, 5, HOUR_MS)) {
    return { success: false, error: 'Too many attempts. Please try again later.', data: null }
  }

  const normalizedEmail = email.trim().toLowerCase()

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return { success: false, error: 'Please enter a valid email address', data: null }
  }

  try {
    await prisma.newsletter.create({ data: { newsletterEmail: normalizedEmail } })

    return { success: true, data: null, error: null }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, error: 'This email is already subscribed', data: null }
    }

    await createLog('error', 'Failed to create newsletter subscription', {
      email: normalizedEmail,
      error: getErrorMessage(error)
    })

    return { success: false, error: 'Something went wrong. Please try again.', data: null }
  }
}
