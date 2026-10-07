'use server'

import { z } from 'zod'
import { ApplicationStatus, Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import prisma from 'prisma/client'
import { requireAccess } from 'lib/auth/guards'
import { hasAccess } from 'lib/auth/access'
import { createLog } from 'lib/actions/log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { parseInput } from 'lib/utils/validate.utils'
import { CLOSED_STATUSES, STATUSES_FOR } from 'lib/application/application.constants'
import type { ActionResult } from 'types/action.types'

const schema = z
  .object({
    applicationId: z.string().min(1),
    status: z.enum(ApplicationStatus).optional(),
    // null unassigns; undefined leaves it alone
    assignedToId: z.string().min(1).nullable().optional()
  })
  .refine((v) => v.status !== undefined || v.assignedToId !== undefined, { message: 'Nothing to change' })

export async function updateApplication(input: unknown): Promise<ActionResult<null>> {
  const gate = await requireAccess('APPLICATIONS')
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  const parsed = parseInput(schema, input)
  if (parsed.ok === false) return parsed.result
  const { applicationId, status, assignedToId } = parsed.data

  try {
    const current = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { type: true, status: true, assignedToId: true }
    })
    if (!current) return { success: false, data: null, error: 'Application not found' }

    if (status && !STATUSES_FOR[current.type].includes(status)) {
      return { success: false, data: null, error: "That status doesn't apply to this kind of application." }
    }

    // Only someone who can open applications can be handed one
    if (assignedToId) {
      const assignee = await prisma.user.findUnique({ where: { id: assignedToId }, select: { role: true, adminAreas: true } })
      if (!assignee || !hasAccess(assignee, 'APPLICATIONS')) {
        return { success: false, data: null, error: "That person doesn't have access to applications." }
      }
    }

    const statusChanged = status !== undefined && status !== current.status
    const assigneeChanged = assignedToId !== undefined && assignedToId !== current.assignedToId
    if (!statusChanged && !assigneeChanged) return { success: true, data: null }

    const data: Prisma.ApplicationUpdateInput = {}
    if (statusChanged) {
      data.status = status
      data.closedAt = CLOSED_STATUSES.includes(status) ? new Date() : null
      if (status === 'APPROVED_WAITING' || status === 'UNDER_REVIEW' || status === 'APPROVED') data.approvedAt = new Date()
    }
    if (assigneeChanged) {
      data.assignedTo = assignedToId ? { connect: { id: assignedToId } } : { disconnect: true }
    }

    await prisma.$transaction([
      prisma.application.update({ where: { id: applicationId }, data }),
      ...(statusChanged
        ? [
            prisma.applicationEvent.create({
              data: { applicationId, kind: 'STATUS_CHANGED', actorId: gate.userId, fromStatus: current.status, toStatus: status }
            })
          ]
        : []),
      ...(assigneeChanged
        ? [
            prisma.applicationEvent.create({
              data: {
                applicationId,
                kind: 'ASSIGNED',
                actorId: gate.userId,
                meta: { from: current.assignedToId, to: assignedToId ?? null }
              }
            })
          ]
        : [])
    ])

    revalidatePath('/admin/applications')
    revalidatePath(`/admin/applications/${applicationId}`)
    return { success: true, data: null }
  } catch (error) {
    await createLog('error', 'Failed to update application', { applicationId, error: getErrorMessage(error) })
    return { success: false, data: null, error: 'Could not save the change. Please try again.' }
  }
}
