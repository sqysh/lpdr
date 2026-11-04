export const MEMORIAL_FILTERS = ['PENDING', 'APPROVED', 'HIDDEN'] as const
export type MemorialFilter = (typeof MEMORIAL_FILTERS)[number]

export const MEMORIAL_FILTER_LABELS: Record<MemorialFilter, string> = {
  PENDING: 'Waiting for review',
  APPROVED: 'On the wall',
  HIDDEN: 'Hidden'
}
