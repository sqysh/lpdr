'use server'

import { auth } from 'lib/auth'
import { Role } from '@prisma/client'

type AdminSession = {
  ok: true // literal true, not boolean
  userId: string
  role: Role
  email: string | null
}

export type AdminFailure = {
  ok: false // literal false, not boolean
  error: string
}

/**
 * Guard for admin-only server actions. Returns a discriminated result:
 *   const gate = await requireAdmin()
 *   if (!gate.ok) return { success: false, error: gate.error, data: null }
 *
 * Only ADMIN and SUPER_USER pass.
 */
export async function requireAdmin(): Promise<AdminSession | AdminFailure> {
  const session = await auth()

  if (!session?.user) {
    return { ok: false, error: 'Unauthorized' }
  }

  const role = session.user.role
  if (role !== 'ADMIN' && role !== 'SUPER_USER') {
    return { ok: false, error: 'Unauthorized' }
  }

  return {
    ok: true,
    userId: session.user.id,
    role,
    email: session.user.email ?? null
  }
}
