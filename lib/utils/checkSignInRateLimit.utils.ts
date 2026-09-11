import 'server-only'
import prisma from 'prisma/client'
import { createLog } from 'lib/actions/log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'

const WINDOW_MS = 60 * 60 * 1000 // one hour

// A person signing in a few times an hour is normal. A list being sprayed is not.
const MAX_PER_EMAIL = 5
const MAX_PER_IP = 10

// A ceiling across everyone, so a spray from many addresses and many IPs cannot
// eat the month's email allowance. Real sign-in volume here is a few a day.
const MAX_TOTAL_PER_HOUR = 200

export type SignInRateLimitResult = { allowed: true } | { allowed: false; reason: string }

export async function checkSignInRateLimit({ email, ip }: { email: string; ip?: string | null }): Promise<SignInRateLimitResult> {
  const since = new Date(Date.now() - WINDOW_MS)

  const emailIdentifier = `email:${email.toLowerCase().trim()}`
  const identifiers = [emailIdentifier]
  if (ip) identifiers.push(`ip:${ip}`)

  try {
    const [attempts, globalCount] = await Promise.all([
      prisma.signInAttempt.groupBy({
        by: ['identifier'],
        where: { identifier: { in: identifiers }, createdAt: { gte: since } },
        _count: { identifier: true }
      }),
      prisma.signInAttempt.count({
        where: { identifier: { startsWith: 'email:' }, createdAt: { gte: since } }
      })
    ])

    const countFor = (identifier: string) => attempts.find((row) => row.identifier === identifier)?._count.identifier ?? 0

    if (globalCount >= MAX_TOTAL_PER_HOUR) return { allowed: false, reason: 'global' }
    if (countFor(emailIdentifier) >= MAX_PER_EMAIL) return { allowed: false, reason: 'email' }
    if (ip && countFor(`ip:${ip}`) >= MAX_PER_IP) return { allowed: false, reason: 'ip' }

    await prisma.signInAttempt.createMany({
      data: identifiers.map((identifier) => ({ identifier }))
    })

    // Roughly one request in fifty cleans up, which is often enough for a table
    // nothing reads after an hour
    if (Math.random() < 0.02) void pruneSignInAttempts()

    return { allowed: true }
  } catch (error) {
    // The limiter is defence in depth behind Turnstile. A database hiccup
    // should not stop people signing in.
    await createLog('error', 'Sign-in rate limit check failed', {
      location: ['signInRateLimit.utils.ts'],
      error: getErrorMessage(error)
    })

    return { allowed: true }
  }
}

export async function pruneSignInAttempts() {
  await prisma.signInAttempt.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - WINDOW_MS) } } }).catch(() => {})
}
