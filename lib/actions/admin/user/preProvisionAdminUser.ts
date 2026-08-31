'use server'

import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'

export async function preProvisionAdminUser(email: string, createdBy: string) {
  const invite = await prisma.pendingAdminInvite.upsert({
    where: { email },
    update: { role: 'ADMIN', createdBy },
    create: { email, role: 'ADMIN', createdBy }
  })

  await createLog('info', 'Admin role pre-provisioned for future sign-in', {
    email: invite.email,
    createdBy
  })

  return invite
}
