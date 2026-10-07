import type { ApplicationStatus } from '@prisma/client'

const IN_PROGRESS = 'border-amber-500/40 text-amber-600 dark:text-amber-400'
export const STATUS_STYLE: Record<ApplicationStatus, string> = {
  SUBMITTED: 'border-sky-500/40 text-sky-600 dark:text-sky-400',
  REQUESTED_MORE_INFO: IN_PROGRESS,
  REFERENCE_CHECK: IN_PROGRESS,
  WAITING_HOME_VISIT: IN_PROGRESS,
  HOME_VISIT_DONE: IN_PROGRESS,
  UNDER_REVIEW: IN_PROGRESS,
  APPROVED_WAITING: 'border-violet-500/40 text-violet-600 dark:text-violet-400',
  APPROVED: 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400',
  ADOPTED: 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400',
  CANCELLED: 'border-zinc-400/40 text-zinc-500'
}

// What the reviewer does next, shown under the status
export const NEXT_STEP: Record<ApplicationStatus, string> = {
  SUBMITTED: 'Read and assign',
  REQUESTED_MORE_INFO: 'Waiting on the applicant',
  REFERENCE_CHECK: 'Contact the references',
  WAITING_HOME_VISIT: 'Schedule the home visit',
  HOME_VISIT_DONE: 'Approve or decline',
  UNDER_REVIEW: 'Being reviewed',
  APPROVED_WAITING: 'Match with a dog',
  APPROVED: 'Approved foster',
  ADOPTED: 'Adopted',
  CANCELLED: 'Closed'
}

// Where it sits in the process, out of 5. Cancelled has no place on the bar
export const STAGE: Partial<Record<ApplicationStatus, number>> = {
  SUBMITTED: 1,
  REQUESTED_MORE_INFO: 1,
  REFERENCE_CHECK: 2,
  WAITING_HOME_VISIT: 3,
  HOME_VISIT_DONE: 4,
  UNDER_REVIEW: 4,
  APPROVED_WAITING: 5,
  APPROVED: 5,
  ADOPTED: 5
}

export function StageBar({ status }: { status: ApplicationStatus }) {
  const stage = STAGE[status]
  if (!stage) return null
  return (
    <span className="flex gap-0.5 mt-1.5" aria-label={`Step ${stage} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`h-0.5 w-3 ${n <= stage ? (stage === 5 ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-border-light dark:bg-border-dark'}`}
          aria-hidden="true"
        />
      ))}
    </span>
  )
}
