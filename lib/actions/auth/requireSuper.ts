'use server'

import { auth } from 'lib/auth'
import { Role } from '@prisma/client'

type SuperSession = {
  ok: true
  userId: string
  role: Role
  email: string | null
}

export type SuperFailure = {
  ok: false
  error: string
}

export async function requireSuper(): Promise<SuperSession | SuperFailure> {
  const session = await auth()

  if (!session?.user?.id) {
    return { ok: false, error: 'Unauthorized' }
  }

  if (session.user.role !== 'SUPER_USER') {
    return { ok: false, error: 'Unauthorized' }
  }

  return {
    ok: true,
    userId: session.user.id,
    role: session.user.role,
    email: session.user.email ?? null
  }
}
