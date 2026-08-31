'use server'

import { getInitials } from 'app/utils/_user.utils'
import prisma from 'prisma/client'

export interface AdminUser {
  id: string
  initials: string
  name: string
  email: string
  role: 'SUPER_USER' | 'ADMIN'
  grantedAt: string
  avatarColor: string
  lastActive: string
}

function getAvatarColor(id: string): string {
  // Deterministic color per user so it doesn't change on re-fetch
  const colors = ['#0891b2', '#a78bfa', '#22c55e', '#f59e0b', '#f472b6', '#0e7490', '#8b5cf6']
  const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  return colors[index]
}

function formatLastActive(date: Date | null): string {
  if (!date) return 'Never'
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHrs = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHrs < 24) return `${diffHrs} hr${diffHrs !== 1 ? 's' : ''} ago`
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
}

function formatGrantedAt(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const admins = await prisma.user.findMany({
    where: {
      role: { in: ['SUPER_USER', 'ADMIN'] }
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      lastLoginAt: true,
      createdAt: true
    },
    orderBy: [
      { role: 'asc' }, // ADMIN before SUPER_USER alphabetically — adjust if needed
      { createdAt: 'asc' }
    ]
  })

  return admins.map((user) => ({
    id: user.id,
    initials: getInitials(user.firstName, user.lastName, user.email),
    name:
      user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : (user.firstName ?? user.email.split('@')[0]),
    email: user.email,
    role: user.role as 'SUPER_USER' | 'ADMIN',
    grantedAt: formatGrantedAt(user.createdAt),
    avatarColor: getAvatarColor(user.id),
    lastActive: formatLastActive(user.lastLoginAt)
  }))
}
