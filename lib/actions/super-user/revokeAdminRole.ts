'use server'

import { auth } from 'lib/auth'
import prisma from 'prisma/client'
import { createLog } from '../log/createLog'

export async function revokeAdminRole(userId: string) {
  const session = await auth()
  const grantor = session?.user?.name ?? session?.user?.email ?? 'Unknown'

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true }
  })

  if (!existing) {
    return { success: false, error: 'User not found' }
  }

  if (existing.role === 'PACK_MEMBER') {
    return { success: false, error: `${existing.email} doesn't have an admin role to revoke` }
  }

  if (existing.role === 'SUPER_USER') {
    return { success: false, error: 'Cannot revoke a superuser role' }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: 'PACK_MEMBER' }
  })

  await createLog('warn', `[SUPER] ${grantor} revoked admin role from ${existing.email}`, {
    targetUserId: userId,
    targetEmail: existing.email,
    previousRole: existing.role,
    grantedBy: grantor
  })

  return { success: true }
}
