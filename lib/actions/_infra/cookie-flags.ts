import 'server-only'
import { cookies } from 'next/headers'

const SESSION_COOKIE_NAMES = ['authjs.session-token', '__Secure-authjs.session-token'] as const

/** Presence check only. Cosmetic gating, never authorization. */
export const hasSessionCookie = async () => {
  const store = await cookies()
  return SESSION_COOKIE_NAMES.some((name) => store.has(name))
}
