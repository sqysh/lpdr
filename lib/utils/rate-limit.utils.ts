type Entry = { count: number; resetAt: number }

const buckets = new Map<string, Entry>()

/**
 * In-memory rate limit. Per serverless instance, so it stops casual abuse
 * and runaway retries, not a distributed attack.
 */
export function isRateLimited(key: string, max: number, windowMs: number) {
  const now = Date.now()
  const entry = buckets.get(key)

  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }

  entry.count += 1
  return entry.count > max
}

export const HOUR_MS = 60 * 60 * 1000
