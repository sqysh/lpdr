import 'server-only'
import { cache } from 'react'
import prisma from 'prisma/client'

export const isMemorialsEnabled = cache(async () => {
  const row = await prisma.memorialSettings.findUnique({ where: { id: 'default' }, select: { isEnabled: true } })
  return row?.isEnabled ?? false
})
