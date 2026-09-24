'use server'

import prisma from 'prisma/client'
import { requireAdmin } from 'lib/auth/guards'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import type { ActionResult } from 'types/action.types'

export type AdopterResult = {
  id: string
  name: string
  email: string
  // When they last paid the application fee, which confirms this is someone who actually applied
  appliedAt: string | null
}

export async function searchAdopters(query: string): Promise<ActionResult<AdopterResult[]>> {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  const q = query.trim()
  if (q.length < 2) return { success: true, data: [] }

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: q, mode: 'insensitive' } },
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        adoptionFees: { select: { createdAt: true }, orderBy: { createdAt: 'desc' }, take: 1 }
      },
      take: 8
    })

    return {
      success: true,
      data: users.map((u) => ({
        id: u.id,
        name: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email.split('@')[0],
        email: u.email,
        appliedAt: u.adoptionFees[0]?.createdAt.toISOString() ?? null
      }))
    }
  } catch (error) {
    await createLog('error', 'Failed to search adopters', { query: q, error: getErrorMessage(error) })
    return { success: false, data: null, error: 'Search failed. Please try again.' }
  }
}
