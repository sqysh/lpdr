import { AdminArea, Role } from '@prisma/client'

export const ADMIN_AREA_LABELS: Record<AdminArea, string> = {
  MONEY: 'Money',
  AUCTIONS: 'Auctions',
  STORE: 'Store',
  DOGS: 'Dachshunds',
  AGREEMENTS: 'Adoption agreements',
  APPLICATIONS: 'Applications',
  PEOPLE: 'Users and newsletter'
}

export function hasAccess(user: { role: Role; adminAreas?: AdminArea[] | null } | null | undefined, area: AdminArea) {
  if (!user) return false
  if (user.role === 'SUPER_USER') return true
  return user.role === 'ADMIN' && (user.adminAreas ?? []).includes(area)
}
