'use server'

import { randomBytes } from 'crypto'
import prisma from 'prisma/client'
import { resend } from 'lib/email/resend'
import { getErrorMessage } from 'lib/utils/error.utils'
import { emailChangeVerificationTemplate } from 'lib/email/templates/email-change-verification.tempate'
import { requireAuth } from 'lib/auth/guards'
import { stampUserGeoFromRequest } from '../../_infra/stampUserGeoFromRequest'
import { createLog } from '../../log/createLog'
import { HOUR_MS, isRateLimited } from 'lib/utils/rate-limit.utils'

const TOKEN_EXPIRY_HOURS = 24

export async function requestEmailChange(newEmail: string) {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  if (isRateLimited(`email-change:${gate.userId}`, 3, HOUR_MS)) {
    return { success: false, error: 'Too many requests. Please try again later.', data: null }
  }

  const normalizedEmail = newEmail.toLowerCase().trim()

  try {
    const currentUser = await prisma.user.findUnique({ where: { id: gate.userId } })
    if (!currentUser) return { success: false, error: 'User not found', data: null }

    if (currentUser.email === normalizedEmail) {
      return { success: false, error: 'That is already your current email address.', data: null }
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      return { success: false, error: 'That email address is already in use.', data: null }
    }

    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

    await prisma.emailChangeToken.deleteMany({ where: { userId: gate.userId } })

    await prisma.emailChangeToken.create({
      data: { userId: gate.userId, newEmail: normalizedEmail, token, expiresAt }
    })

    const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/verify-email-change?token=${token}`

    await resend.emails.send({
      from: 'Little Paws Dachshund Rescue <auth@littlepawsdr.org>',
      to: normalizedEmail,
      subject: 'Verify your new email address',
      html: emailChangeVerificationTemplate({
        firstName: currentUser.firstName ?? currentUser.email.split('@')[0],
        currentEmail: currentUser.email,
        newEmail: normalizedEmail,
        verifyUrl
      })
    })

    // Audit metadata only, so a failure here must not fail the request
    try {
      const details = await stampUserGeoFromRequest(gate.userId)

      await createLog('info', 'Email change requested', {
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
    } catch (logError) {
      await createLog('error', 'Email change requested but geo stamp failed', {
        userId: gate.userId,
        newEmail: normalizedEmail,
        error: getErrorMessage(logError)
      })
    }

    return { success: true, error: null, data: null }
  } catch (err) {
    await createLog('error', 'Failed to request email change', {
      userId: gate.userId,
      error: getErrorMessage(err)
    })
    return { success: false, error: 'Failed to send verification email. Please try again.', data: null }
  }
}
