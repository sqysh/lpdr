'use server'

import { Prisma } from '@prisma/client'
import prisma from 'prisma/client'
import { requireAccess } from 'lib/auth/guards'
import { createLog } from 'lib/actions/log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { serialize } from 'lib/utils/serializers.utils'
import { CLOSED_STATUSES, type ApplicationView } from 'lib/application/application.constants'

export async function getApplications({ view = 'open', q = '' }: { view?: ApplicationView; q?: string } = {}) {
  const gate = await requireAccess('APPLICATIONS')
  if (gate.ok === false) return { success: false as const, data: null, error: gate.error }

  const byView: Record<ApplicationView, Prisma.ApplicationWhereInput> = {
    unassigned: { status: 'SUBMITTED', assignedToId: null },
    mine: { assignedToId: gate.userId, status: { notIn: CLOSED_STATUSES } },
    open: { status: { notIn: CLOSED_STATUSES } },
    waiting: { status: 'APPROVED_WAITING' },
    closed: { status: { in: CLOSED_STATUSES } },
    all: {}
  }

  const search = q.trim()
  const where: Prisma.ApplicationWhereInput = {
    ...byView[view],
    ...(search && {
      OR: [
        { dogName: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } }
      ]
    })
  }

  try {
    const applications = await prisma.application.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      take: 200,
      select: {
        id: true,
        type: true,
        status: true,
        dogName: true,
        submittedAt: true,
        updatedAt: true,
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { events: true } }
      }
    })
    return { success: true as const, error: null, data: serialize(applications) }
  } catch (error) {
    await createLog('error', 'Failed to load applications', { view, error: getErrorMessage(error) })
    return { success: false as const, data: null, error: 'Failed to load applications. Please try again.' }
  }
}
