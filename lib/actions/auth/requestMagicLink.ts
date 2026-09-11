'use server'

import { signIn } from 'lib/auth'
import { getRequestDetails } from 'lib/utils/log.server.utils'
import { createLog } from 'lib/actions/log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { EMAIL_REGEX } from 'lib/constants/regex.constants'
import { verifyTurnstile } from 'lib/utils/verifyTurnstile.utils'

const GENERIC_ERROR = 'Something went wrong. Please try again.'

/** Only same-origin paths, so a crafted redirectTo cannot send people off-site. */
function safeRedirect(redirectTo?: string) {
  if (!redirectTo) return undefined
  if (!redirectTo.startsWith('/') || redirectTo.startsWith('//')) return undefined
  return redirectTo
}

export async function requestMagicLink({ email, token, redirectTo }: { email: string; token?: string; redirectTo?: string }) {
  const normalizedEmail = email.toLowerCase().trim()

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    return { success: false, error: 'Please enter a valid email address', data: null }
  }

  const details = await getRequestDetails()

  const verified = await verifyTurnstile({ token, action: 'magic-link', ip: details.ip })

  if (!verified) {
    return { success: false, error: 'Verification failed. Please try again.', data: null }
  }

  try {
    await signIn('email', {
      email: normalizedEmail,
      redirect: false,
      redirectTo: safeRedirect(redirectTo)
    })

    return { success: true, error: null, data: null }
  } catch (error) {
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) throw error

    await createLog('error', 'Failed to send magic link', {
      email: normalizedEmail,
      error: getErrorMessage(error)
    })

    return { success: false, error: GENERIC_ERROR, data: null }
  }
}
