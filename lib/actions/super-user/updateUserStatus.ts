'use server'

import prisma from 'prisma/client'
import { UserStatus } from '@prisma/client'
import { auth } from 'lib/auth'
import { createLog } from '../log/createLog'

export async function updateUserStatus(userId: string, status: UserStatus, reason?: string) {
  try {
    const session = await auth()
    const actor = session?.user?.email ?? 'Unknown'

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, status: true, role: true }
    })

    if (!user) return { success: false, error: 'User not found' }
    if (user.status === status)
      return { success: false, error: `User is already ${status.toLowerCase()}` }
    if (user.role === 'SUPER_USER')
      return { success: false, error: 'Cannot modify a superuser status' }
    if (user.status === 'TERMINATED' && status === 'SUSPENDED')
      return { success: false, error: 'Cannot suspend a terminated user — reinstate first' }

    await prisma.user.update({
      where: { id: userId },
      data: { status }
    })

    await createLog(
      status === 'ACTIVE' ? 'info' : 'warn',
      `[SUPER] ${actor} set ${user.email} to ${status}`,
      {
        targetUserId: userId,
        targetEmail: user.email,
        previousStatus: user.status,
        newStatus: status,
        reason: reason ?? null,
        actor
      }
    )

    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}
