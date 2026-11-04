import prisma from 'prisma/client'
import { AdminMemorialsClient } from './AdminMemorialsClient'

export default async function AdminMemorialsPage() {
  const memorials = await prisma.memorial.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      dogName: true,
      message: true,
      photoUrl: true,
      donorDisplayName: true,
      showDonorName: true,
      status: true,
      hiddenReason: true,
      approvedAt: true,
      expiresAt: true,
      createdAt: true,
      updatedAt: true,
      order: { select: { id: true, totalAmount: true, status: true, customerName: true, customerEmail: true } }
    }
  })

  return (
    <AdminMemorialsClient
      memorials={memorials.map((m) => ({
        ...m,
        approvedAt: m.approvedAt?.toISOString() ?? null,
        expiresAt: m.expiresAt?.toISOString() ?? null,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
        order: m.order ? { ...m.order, totalAmount: Number(m.order.totalAmount) } : null
      }))}
    />
  )
}
