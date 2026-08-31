export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
] as const

export const CURRENT_YEAR = new Date().getFullYear()

export const YEARS = Array.from({ length: 8 }, (_, i) => String(CURRENT_YEAR + 1 - i))

export const MONTH_INDEX: Record<string, number> = Object.fromEntries(MONTHS.map((m, i) => [m, i]))
