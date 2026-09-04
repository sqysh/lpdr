'use server'

import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { resend } from 'lib/email/resend'
import { emailChangeNotificationTemplate } from 'lib/email/templates/email-change-notification.template'
import { requireAuth } from 'lib/auth/guards'

export async function verifyEmailChange(token: string) {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  try {
    const record = await prisma.emailChangeToken.findUnique({ where: { token } })

    if (!record) return { success: false, error: 'Invalid or expired verification link.', data: null }

    if (record.userId !== gate.userId) {
      return { success: false, error: 'Invalid or expired verification link.', data: null }
    }

    if (record.expiresAt < new Date()) {
      await prisma.emailChangeToken.delete({ where: { token } })
      return {
        success: false,
        error: 'This verification link has expired. Please request a new one.',
        data: null
      }
    }

    const user = await prisma.user.findUnique({ where: { id: record.userId } })
    if (!user) return { success: false, error: 'User not found.', data: null }

    const newEmail = record.newEmail.trim().toLowerCase()

    const existing = await prisma.user.findUnique({ where: { email: newEmail } })
    if (existing) {
      await prisma.emailChangeToken.delete({ where: { token } })
      return { success: false, error: 'That email address is already in use.', data: null }
    }

    const oldEmail = user.email

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { email: newEmail }
      }),
      prisma.emailChangeToken.delete({ where: { token } })
    ])

    // The change is committed at this point, so a failure below must not
    // report the whole operation as failed
    try {
      await resend.emails.send({
        from: 'Little Paws Dachshund Rescue <auth@littlepawsdr.org>',
        to: oldEmail,
        subject: 'Your email address has been changed',
        html: emailChangeNotificationTemplate({
          firstName: user.firstName ?? oldEmail.split('@')[0],
          oldEmail,
          newEmail
        })
      })
    } catch (emailError) {
      await createLog('error', 'Email changed but notification failed to send', {
        userId: record.userId,
        oldEmail,
        error: getErrorMessage(emailError)
      })
    }

    await createLog('info', 'Email changed', {
      userId: record.userId,
      oldEmail,
      newEmail
    })

    return { success: true, error: null, data: null }
  } catch (err) {
    await createLog('error', 'Failed to verify email change', {
      error: getErrorMessage(err)
    })
    return { success: false, error: 'Something went wrong. Please try again.', data: null }
  }
}
