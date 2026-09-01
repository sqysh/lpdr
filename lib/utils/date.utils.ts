const TZ = 'America/New_York'

/** Formats a date as "Jan 1, 2026", optionally with time as "Jan 1, 2026, 12:00 PM" */
export function formatDate(date: Date | string, includeTime = false) {
  return new Date(date).toLocaleString('en-US', {
    timeZone: TZ,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...(includeTime && { hour: 'numeric', minute: '2-digit', hour12: true })
  })
}

/** Formats a date as "Jan 1, 2026, 12:00 PM" — shorthand for formatDate(date, true) */
export function formatDateTime(date: Date | string) {
  return formatDate(date, true)
}

/** Returns the number of days remaining until a given end date (rounded up) */
export function getDaysRemaining(endDate: Date | string) {
  const diff = new Date(endDate).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/** Converts a date to the YYYY-MM-DDTHH:MM format required by HTML input[type="datetime-local"] */
export function toDatetimeLocal(date: Date | string | null | undefined): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

export function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`
}

export function monthRange(year: number, month: number) {
  return {
    start: new Date(year, month, 1),
    end: new Date(year, month + 1, 0, 23, 59, 59)
  }
}

export function lastNMonths(n: number) {
  const now = new Date()
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1)
    const range = monthRange(d.getFullYear(), d.getMonth())
    return {
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      ...range
    }
  })
}
