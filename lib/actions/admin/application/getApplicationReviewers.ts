'use server'

import prisma from 'prisma/client'
import { requireAccess } from 'lib/auth/guards'

export async function getApplicationReviewers() {
  const gate = await requireAccess('APPLICATIONS')
  if (gate.ok === false) return []

  return prisma.user.findMany({
    where: { OR: [{ role: 'SUPER_USER' }, { role: 'ADMIN', adminAreas: { has: 'APPLICATIONS' } }] },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    select: { id: true, firstName: true, lastName: true, email: true }
  })
}
