import 'server-only'
import { redirect } from 'next/navigation'
import { auth } from 'lib/auth'
import { Role } from '@prisma/client'

export type Gate =
  | { ok: true; userId: string; role: Role; email: string | null }
  | { ok: false; error: string }

const requireRole = async (allowed?: Role[]): Promise<Gate> => {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: 'Unauthorized' }
  if (allowed && !allowed.includes(session.user.role)) return { ok: false, error: 'Unauthorized' }

  return {
    ok: true,
    userId: session.user.id,
    role: session.user.role,
    email: session.user.email ?? null
  }
}

// For server actions — return the union, caller decides what to do
export const requireAuth = () => requireRole()
export const requireAdmin = () => requireRole([Role.ADMIN, Role.SUPER_USER])
export const requireSuper = () => requireRole([Role.SUPER_USER])

// For pages and layouts — redirect instead of returning
export async function requireAuthPage() {
  const gate = await requireAuth()
  if (!gate.ok) redirect('/auth/login')
  return gate
}

export async function requireAdminPage() {
  const gate = await requireAuthPage()
  if (gate.role !== Role.ADMIN && gate.role !== Role.SUPER_USER) redirect('/my-pack')
  return gate
}

export async function requireSuperPage() {
  const gate = await requireAuthPage()
  if (gate.role !== Role.SUPER_USER) {
    redirect(gate.role === Role.PACK_MEMBER ? '/my-pack' : '/admin/dashboard')
  }
  return gate
}
