'use server'

import { randomBytes } from 'crypto'
import prisma from 'prisma/client'
import { resend } from 'lib/email/resend'
import { getErrorMessage } from 'app/utils/_error.utils'
import { emailChangeVerificationTemplate } from 'lib/email/templates/email-change-verification.tempate'
import { AuthFailure, requireAuth } from '../../auth/requireAuth'
import { stampUserGeoFromRequest } from '../../auth/stampUserGeoFromRequest'
import { createLog } from '../../log/createLog'

const TOKEN_EXPIRY_HOURS = 24

export async function requestEmailChange(newEmail: string): Promise<{
  success: boolean
  error?: string
}> {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, error: (gate as AuthFailure).error }

  const normalizedEmail = newEmail.toLowerCase().trim()

  try {
    const currentUser = await prisma.user.findUnique({ where: { id: gate.userId } })
    if (!currentUser) return { success: false, error: 'User not found' }

    if (currentUser.email === normalizedEmail) {
      return { success: false, error: 'That is already your current email address.' }
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      return { success: false, error: 'That email address is already in use.' }
    }

    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

    const [details] = await Promise.all([
      stampUserGeoFromRequest(gate.userId),
      prisma.emailChangeToken.deleteMany({ where: { userId: gate.userId } })
    ])
    await prisma.emailChangeToken.create({
      data: { userId: gate.userId, newEmail: normalizedEmail, token, expiresAt }
    })

    const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email-change?token=${token}`

    await Promise.all([
      resend.emails.send({
        from: 'Little Paws Dachshund Rescue <auth@littlepawsdr.org>',
        to: normalizedEmail,
        subject: 'Verify your new email address',
        html: emailChangeVerificationTemplate({
          firstName: currentUser.firstName ?? currentUser.email.split('@')[0],
          currentEmail: currentUser.email,
          newEmail: normalizedEmail,
          verifyUrl
        })
      }),
      createLog('info', 'Email change requested', {
        userId: gate.userId,
        currentEmail: currentUser.email,
        newEmail: normalizedEmail,
        ip: details.ip,
        device: details.device,
        browser: details.browser,
        os: details.os,
        city: details.geoCity,
        region: details.geoRegion,
        country: details.geoCountry
      })
    ])

    return { success: true }
  } catch (err) {
    await createLog('error', 'Failed to request email change', {
      userId: gate.userId,
      error: getErrorMessage(err)
    })
    return { success: false, error: 'Failed to send verification email. Please try again.' }
  }
}
