'use server'

import prisma from 'prisma/client'
import { requireSuper } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import { createLog } from '../log/createLog'

export type ManagedUser = {
  id: string
  name: string
  email: string
  status: 'SUSPENDED' | 'TERMINATED'
  actedAt: string
  reason: string | null
}

export async function getManagedUsers() {
  const gate = await requireSuper()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  try {
    const users = await prisma.user.findMany({
      where: { status: { in: ['SUSPENDED', 'TERMINATED'] } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        updatedAt: true
      },
      orderBy: { updatedAt: 'desc' }
    })

    const data: ManagedUser[] = users.map((u) => ({
      id: u.id,
      name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email.split('@')[0],
      email: u.email,
      status: u.status as 'SUSPENDED' | 'TERMINATED',
      actedAt: u.updatedAt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'America/New_York'
      }),
      reason: null
    }))

    return { success: true, error: null, data }
  } catch (error) {
    await createLog('error', 'Failed to fetch managed users', { error: getErrorMessage(error) })
    return { success: false, error: 'Failed to fetch managed users', data: null }
  }
}
