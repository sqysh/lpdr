const DEFAULT_MIN_MS = 3000

/**
 * Returns why a submission looks automated, or null if it looks human.
 *
 * `minMs` of null skips the timing check. Worth doing on single-field forms,
 * where someone pasting an address can legitimately beat the threshold and a
 * silent rejection would leave them thinking they had subscribed.
 */
export function looksAutomated(
  data: { website?: string; renderedAt?: number },
  minMs: number | null = DEFAULT_MIN_MS
): string | null {
  if (data.website && data.website.trim().length > 0) return 'honeypot'

  if (minMs === null) return null

  const renderedAt = data.renderedAt ?? 0
  if (renderedAt <= 0) return null

  const elapsed = Date.now() - renderedAt
  if (elapsed < minMs) return 'submitted too fast'

  return null
}
