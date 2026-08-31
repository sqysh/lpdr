import { RoleFilter } from 'types/_user'

export const PAGE_SIZE = 25

export const ROLE_FILTERS = ['ALL', 'SUPER_USER', 'ADMIN', 'PACK_MEMBER'] as const

export const ROLE_FILTER_LABELS: Record<RoleFilter, string> = {
  ALL: 'All roles',
  SUPER_USER: 'Super User',
  ADMIN: 'Admin',
  PACK_MEMBER: 'Pack Member'
}
