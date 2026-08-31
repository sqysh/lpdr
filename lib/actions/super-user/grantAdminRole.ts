'use server'

import { auth } from 'lib/auth'
import prisma from 'prisma/client'
import { createLog } from '../log/createLog'

export async function grantAdminRole(email: string, role: 'ADMIN' | 'SUPER_USER') {
  const session = await auth()
  const grantor = session?.user?.name ?? session?.user?.email ?? 'Unknown'

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true }
  })

  if (!existing) {
    return {
      success: false,
      error: `No user found with email ${email} — they must sign up first before being granted a role`
    }
  }

  if (existing.role === role) {
    return { success: false, error: `${email} already has the ${role} role` }
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role },
    select: { id: true, email: true, firstName: true, lastName: true }
  })

  await createLog('warn', `[SUPER] ${grantor} granted ${role} role to ${email}`, {
    targetUserId: user.id,
    targetEmail: email,
    role,
    grantedBy: grantor
  })

  return { success: true, data: user }
}
