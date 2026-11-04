import prisma from 'prisma/client'

export function getMemorialSettings() {
  return prisma.memorialSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default' }
  })
}
