import { connection } from 'next/server'
import RainbowBridgeClient from './RainbowBridgeClient'
import { isMemorialsEnabled } from 'lib/actions/public/memorial/isMemorialsEnabled'
import prisma from 'prisma/client'

export const metadata = {
  title: 'Rainbow Bridge | Little Paws Dachshund Rescue',
  description: 'A place to remember the dachshunds we have loved and lost.'
}

const WALL_LIMIT = 120

export default async function RainbowBridgePage() {
  // Approvals and new gifts should show up without a redeploy
  await connection()

  const now = new Date()

  const [memorialsEnabled, memorials] = await Promise.all([
    isMemorialsEnabled(),
    prisma.memorial.findMany({
      where: {
        status: 'APPROVED',
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }]
      },
      orderBy: { approvedAt: 'desc' },
      take: WALL_LIMIT,
      select: {
        id: true,
        dogName: true,
        message: true,
        photoUrl: true,
        donorDisplayName: true,
        showDonorName: true,
        approvedAt: true,
        createdAt: true,
        updatedAt: true
      }
    })
  ])

  return (
    <RainbowBridgeClient
      canRemember={memorialsEnabled}
      memorials={memorials.map((m) => ({
        id: m.id,
        dogName: m.dogName,
        message: m.message,
        photoUrl: m.photoUrl,
        donorName: m.showDonorName ? m.donorDisplayName : null,
        date: (m.approvedAt ?? m.createdAt).toISOString(),
        version: m.updatedAt.getTime()
      }))}
    />
  )
}
