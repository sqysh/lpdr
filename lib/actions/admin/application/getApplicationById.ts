'use server'

import prisma from 'prisma/client'
import { requireAccess } from 'lib/auth/guards'
import { createLog } from 'lib/actions/log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { serialize } from 'lib/utils/serializers.utils'

export async function getApplicationById(id: string) {
  const gate = await requireAccess('APPLICATIONS')
  if (gate.ok === false) return { success: false as const, data: null, error: gate.error }

  try {
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, address: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        adoptionAgreement: { select: { id: true, status: true } },
        events: {
          orderBy: { createdAt: 'desc' },
          include: { actor: { select: { id: true, firstName: true, lastName: true, email: true } } }
        }
      }
    })
    if (!application) return { success: false as const, data: null, error: 'Application not found' }

    // Everything else this person has sent us, plus everyone who can be handed an application
    const [otherApplications, legacy, reviewers] = await Promise.all([
      prisma.application.findMany({
        where: { userId: application.userId, id: { not: id } },
        orderBy: { submittedAt: 'desc' },
        select: { id: true, type: true, status: true, dogName: true, submittedAt: true }
      }),
      prisma.legacyApplication.findMany({
        where: {
          OR: [
            { userId: application.userId },
            { email: { equals: application.user.email, mode: 'insensitive' } },
            ...(application.user.firstName && application.user.lastName
              ? [
                  {
                    firstName: { equals: application.user.firstName, mode: 'insensitive' as const },
                    lastName: { equals: application.user.lastName, mode: 'insensitive' as const }
                  }
                ]
              : [])
          ]
        },
        orderBy: { submittedAt: 'desc' }
      }),
      prisma.user.findMany({
        where: { OR: [{ role: 'SUPER_USER' }, { role: 'ADMIN', adminAreas: { has: 'APPLICATIONS' } }] },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
        select: { id: true, firstName: true, lastName: true }
      })
    ])

    return {
      success: true as const,
      error: null,
      data: serialize({ application, otherApplications, legacy, reviewers, viewerId: gate.userId })
    }
  } catch (error) {
    await createLog('error', 'Failed to load application', { applicationId: id, error: getErrorMessage(error) })
    return { success: false as const, data: null, error: 'Failed to load the application. Please try again.' }
  }
}
