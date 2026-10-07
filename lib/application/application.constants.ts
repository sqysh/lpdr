import { ApplicationStatus, ApplicationType } from '@prisma/client'

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  SUBMITTED: 'Submitted',
  REQUESTED_MORE_INFO: 'Requested more info',
  REFERENCE_CHECK: 'Reference check',
  WAITING_HOME_VISIT: 'Waiting home visit',
  HOME_VISIT_DONE: 'Home visit done',
  APPROVED_WAITING: 'Approved, waiting for a dog',
  UNDER_REVIEW: 'Under review',
  ADOPTED: 'Adopted',
  APPROVED: 'Approved',
  CANCELLED: 'Cancelled'
}

// An application is finished once it reaches one of these. Nothing is deleted, it just leaves the open lists
export const CLOSED_STATUSES: ApplicationStatus[] = ['ADOPTED', 'APPROVED', 'CANCELLED']

// Foster has no dog, so no waiting for one, no agreement and no adoption; it ends at Approved
export const STATUSES_FOR: Record<ApplicationType, ApplicationStatus[]> = {
  ADOPTION: [
    'SUBMITTED',
    'REQUESTED_MORE_INFO',
    'REFERENCE_CHECK',
    'WAITING_HOME_VISIT',
    'HOME_VISIT_DONE',
    'APPROVED_WAITING',
    'UNDER_REVIEW',
    'ADOPTED',
    'CANCELLED'
  ],
  FOSTER: ['SUBMITTED', 'REQUESTED_MORE_INFO', 'REFERENCE_CHECK', 'WAITING_HOME_VISIT', 'HOME_VISIT_DONE', 'APPROVED', 'CANCELLED']
}

export type ApplicationView = 'unassigned' | 'mine' | 'open' | 'waiting' | 'closed' | 'all'
