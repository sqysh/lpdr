import 'server-only'
import { redirect } from 'next/navigation'
import { auth } from 'lib/auth'
import { AdminArea, Role } from '@prisma/client'
import { hasAccess, hasFullAccess } from 'lib/auth/access'

export type Gate = { ok: true; userId: string; role: Role; email: string | null; adminAreas: AdminArea[] } | { ok: false; error: string }

const requireRole = async (allowed?: Role[]): Promise<Gate> => {
  const session = await auth()
  if (!session?.user?.id) return { ok: false, error: 'Unauthorized' }
  if (allowed && !allowed.includes(session.user.role)) return { ok: false, error: 'Unauthorized' }

  return {
    ok: true,
    userId: session.user.id,
    role: session.user.role,
    email: session.user.email ?? null,
    adminAreas: session.user.adminAreas ?? []
  }
}

// For server actions — return the union, caller decides what to do
export const requireAuth = () => requireRole()
export const requireAdmin = () => requireRole([Role.ADMIN, Role.SUPER_USER])
export const requireSuper = () => requireRole([Role.SUPER_USER])

export async function requireAccess(area: AdminArea): Promise<Gate> {
  const gate = await requireAdmin()
  if (!gate.ok) return gate
  if (!hasAccess(gate, area)) return { ok: false, error: "You don't have access to this part of the admin." }
  return gate
}

export async function requireFullAccess(): Promise<Gate> {
  const gate = await requireAdmin()
  if (!gate.ok) return gate
  if (!hasFullAccess(gate)) return { ok: false, error: 'Only admins with full access can change who is an admin.' }
  return gate
}

// Where each area lives, so someone without access lands somewhere they can use
const AREA_HOME: Record<AdminArea, string> = {
  MONEY: '/admin/dashboard',
  APPLICATIONS: '/admin/applications',
  AGREEMENTS: '/admin/adoption-agreements',
  AUCTIONS: '/admin/auctions',
  DOGS: '/admin/dachshunds',
  STORE: '/admin/products',
  PEOPLE: '/admin/users'
}

export function adminHomeFor(gate: { role: Role; adminAreas: AdminArea[] }) {
  const first = (Object.keys(AREA_HOME) as AdminArea[]).find((area) => hasAccess(gate, area))
  return first ? AREA_HOME[first] : '/admin/guide'
}

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

export async function requireAccessPage(area: AdminArea) {
  const gate = await requireAdminPage()
  if (!hasAccess(gate, area)) redirect(adminHomeFor(gate))
  return gate
}

export async function requireSuperPage() {
  const gate = await requireAuthPage()
  if (gate.role !== Role.SUPER_USER) {
    redirect(gate.role === Role.PACK_MEMBER ? '/my-pack' : adminHomeFor(gate))
  }
  return gate
}
