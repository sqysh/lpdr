import { AdoptionFeeStatus } from 'types/_adoption-fee'

export const statusStyles: Record<AdoptionFeeStatus, string> = {
  ACTIVE: 'border-primary-light/40 dark:border-primary-dark/40 text-primary-light dark:text-primary-dark',
  APPROVED: 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400',
  REJECTED: 'border-red-500/40 text-red-600 dark:text-red-400',
  EXPIRED: 'border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark'
}

export const FILTERS: (AdoptionFeeStatus | 'ALL')[] = ['ALL', 'ACTIVE', 'EXPIRED']
