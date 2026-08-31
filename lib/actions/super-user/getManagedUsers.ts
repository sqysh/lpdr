'use server'

import prisma from 'prisma/client'

export type ManagedUser = {
  id: string
  name: string
  email: string
  status: 'SUSPENDED' | 'TERMINATED'
  actedAt: string
  reason: string | null
}

export async function getManagedUsers() {
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

  return users.map((u) => ({
    id: u.id,
    name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email.split('@')[0],
    email: u.email,
    status: u.status as 'SUSPENDED' | 'TERMINATED',
    actedAt: u.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    reason: null // add a reason field to User model if you want to persist this
  }))
}
