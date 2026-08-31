'use server'

import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'

export async function promoteUserToAdmin(userId: string, promotedBy: string) {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role: 'ADMIN' },
    select: { id: true, email: true, role: true }
  })

  await createLog('info', 'Existing user promoted to admin', {
    userId: updated.id,
    email: updated.email,
    promotedBy
  })

  return updated
}
