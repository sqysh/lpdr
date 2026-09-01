export function formatRole(role: string): string {
  const ROLE_LABELS: Record<string, string> = {
    SUPER_USER: 'Super User',
    ADMIN: 'Admin',
    PACK_MEMBER: 'Pack Member'
  }
  return ROLE_LABELS[role] ?? role
}

export function getInitials(
  firstName?: string | null,
  lastName?: string | null,
  email?: string
): string {
  if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase()
  if (firstName) return firstName.slice(0, 2).toUpperCase()
  return (email ?? '??').slice(0, 2).toUpperCase()
}
