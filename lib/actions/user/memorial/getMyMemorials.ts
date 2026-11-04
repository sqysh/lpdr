'use server'

import prisma from 'prisma/client'
import { MemorialStatus } from '@prisma/client'
import { requireAuth } from 'lib/auth/guards'
import { createLog } from 'lib/actions/log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import type { ActionResult } from 'types/action.types'

export type MyMemorial = {
  id: string
  dogName: string
  photoUrl: string | null
  status: MemorialStatus
  approvedAt: string | null
  expiresAt: string | null
  createdAt: string
  updatedAt: string
  orderId: string
  amount: number
}

export async function getMyMemorials(): Promise<ActionResult<MyMemorial[]>> {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  try {
    // Memorials are tied to the person through the order they paid with
    const memorials = await prisma.memorial.findMany({
      where: { order: { userId: gate.userId } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        dogName: true,
        photoUrl: true,
        status: true,
        approvedAt: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
        order: { select: { id: true, totalAmount: true } }
      }
    })

    return {
      success: true,
      data: memorials.map((m) => ({
        id: m.id,
        dogName: m.dogName,
        photoUrl: m.photoUrl,
        status: m.status,
        approvedAt: m.approvedAt?.toISOString() ?? null,
        expiresAt: m.expiresAt?.toISOString() ?? null,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
        orderId: m.order.id,
        amount: Number(m.order.totalAmount)
      }))
    }
  } catch (error) {
    await createLog('error', 'Failed to load memorials for My Pack', { userId: gate.userId, error: getErrorMessage(error) })
    return { success: false, data: null, error: "We couldn't load your memorials." }
  }
}
