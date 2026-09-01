'use server'

import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { EMAIL_REGEX } from 'lib/constants/regex.constants'

export default async function createNewsletter(email: string) {
  const normalizedEmail = email.trim().toLowerCase()

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return { success: false, error: 'Please enter a valid email address', data: null }
  }

  try {
    const existing = await prisma.newsletter.findUnique({
      where: { newsletterEmail: normalizedEmail }
    })

    if (existing) {
      return { success: false, error: 'This email is already subscribed', data: null }
    }

    const newsletter = await prisma.newsletter.create({
      data: { newsletterEmail: normalizedEmail }
    })

    return { success: true, data: newsletter, error: null }
  } catch (error) {
    await createLog('error', 'Failed to create newsletter subscription', {
      email: normalizedEmail,
      error: getErrorMessage(error)
    })

    return { success: false, error: 'Something went wrong. Please try again.', data: null }
  }
}
