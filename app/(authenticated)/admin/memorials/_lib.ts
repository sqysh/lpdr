import type { AdminMemorial } from 'types/memorial.types'
import type { MemorialFilter } from 'lib/constants/memorial.constants'

export const tabOf = (m: AdminMemorial): MemorialFilter =>
  m.status === 'PENDING' ? 'PENDING' : m.status === 'HIDDEN' ? 'HIDDEN' : 'APPROVED'

export const isExpired = (m: AdminMemorial) => !!m.expiresAt && new Date(m.expiresAt) < new Date()

const btn =
  'inline-flex items-center gap-1.5 px-3 py-2 text-[10px] font-mono tracking-eyebrow uppercase border transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark'
export const btnPrimary = `${btn} border-primary-light dark:border-primary-dark bg-primary-light dark:bg-primary-dark text-white hover:opacity-90`
export const btnQuiet = `${btn} border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:border-primary-light dark:hover:border-primary-dark hover:text-primary-light dark:hover:text-primary-dark`
