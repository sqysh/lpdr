import 'server-only'
import { createLog } from 'lib/actions/log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const MAX_TOKEN_LENGTH = 2048
const TIMEOUT_MS = 10_000

type SiteVerifyResponse = {
  success?: boolean
  action?: string
  hostname?: string
  'error-codes'?: string[]
}

const allowedHostnames = () =>
  (process.env.TURNSTILE_HOSTNAMES ?? '')
    .split(',')
    .map((hostname) => hostname.trim())
    .filter(Boolean)

/**
 * Checks a Turnstile token with Cloudflare. Beyond `success`, this confirms the
 * token was minted for the surface being protected and on a hostname we expect,
 * so a token from the dev site or from another form cannot be replayed here.
 *
 * Fails closed. Rejections are logged at info because blocked bots are the
 * system working; misconfiguration and infrastructure problems log louder so
 * they surface on the super dashboard.
 */
export async function verifyTurnstile({
  token,
  action,
  ip
}: {
  token?: string
  action: string
  ip?: string | null
}): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY

  if (!secret) {
    await createLog('error', 'Turnstile secret key is not configured', { action })
    return false
  }

  if (typeof token !== 'string' || token.length === 0 || token.length > MAX_TOKEN_LENGTH) return false

  const hostnames = allowedHostnames()

  if (hostnames.length === 0) {
    await createLog('error', 'TURNSTILE_HOSTNAMES is not configured', { action })
    return false
  }

  try {
    const body = new URLSearchParams({ secret, response: token })
    if (ip) body.set('remoteip', ip)

    const response = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      body
    })

    if (!response.ok) {
      await createLog('warn', 'Turnstile verification returned a non-OK status', {
        action,
        status: response.status
      })
      return false
    }

    const result = (await response.json()) as SiteVerifyResponse

    if (result.success !== true) {
      await createLog('info', 'Turnstile token rejected', {
        action,
        errorCodes: result['error-codes'] ?? []
      })
      return false
    }

    // A token minted for another form, or on the dev site, must not work here
    if (result.action !== action) {
      await createLog('warn', 'Turnstile action mismatch', { expected: action, received: result.action })
      return false
    }

    if (!result.hostname || !hostnames.includes(result.hostname)) {
      await createLog('warn', 'Turnstile hostname not allowed', { action, received: result.hostname })
      return false
    }

    return true
  } catch (error) {
    // Fail closed. An unreachable Cloudflare is rare; an open door is not worth
    // the convenience.
    await createLog('error', 'Turnstile verification failed', { action, error: getErrorMessage(error) })
    return false
  }
}
