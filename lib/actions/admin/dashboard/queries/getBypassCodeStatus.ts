import prisma from 'prisma/client'

export async function getBypassCodeStatus() {
  const bypassCode = await prisma.adoptionApplicationBypassCode.findFirst({
    select: { bypassCode: true, updatedAt: true, nextRotationAt: true },
    orderBy: { updatedAt: 'desc' }
  })

  return {
    bypassCode: bypassCode?.bypassCode ?? null,
    bypassCodeRotatesAt: bypassCode?.nextRotationAt?.toISOString() ?? null
  }
}
