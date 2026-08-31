'use server'

import { auth } from 'lib/auth'
import { Role } from '@prisma/client'

type AuthSession = {
  ok: true
  userId: string
  role: Role
  email: string | null
}

export type AuthFailure = {
  ok: false
  error: string
}

export async function requireAuth(): Promise<AuthSession | AuthFailure> {
  const session = await auth()

  if (!session?.user?.id) {
    return { ok: false, error: 'Unauthorized' }
  }

  return {
    ok: true,
    userId: session.user.id,
    role: session.user.role,
    email: session.user.email ?? null
  }
}
