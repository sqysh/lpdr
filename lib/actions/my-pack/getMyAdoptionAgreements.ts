'use server'

import prisma from 'prisma/client'
import { requireAuth } from 'lib/auth/guards'
import { createLog } from '../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { serialize } from 'lib/utils/serializers.utils'

export async function getMyAdoptionAgreements() {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false as const, data: null, error: gate.error }

  try {
    const agreements = await prisma.adoptionAgreement.findMany({
      // Drafts aren't theirs to see yet, and a cancelled agreement is gone as far as they're concerned
      where: { userId: gate.userId, status: { notIn: ['DRAFT', 'VOID'] } },
      select: {
        id: true,
        status: true,
        dogName: true,
        dogPhoto: true,
        dogRescueId: true,
        paymentMethod: true,
        adoptionFee: true,
        healthCertificateFee: true,
        additionalDonation: true,
        sentAt: true,
        paidAt: true,
        signatures: { select: { role: true } },
        order: { select: { id: true, totalAmount: true } }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return { success: true as const, data: serialize(agreements), error: null }
  } catch (error) {
    await createLog('error', 'Failed to load adopter agreements', { userId: gate.userId, error: getErrorMessage(error) })
    return { success: false as const, data: null, error: 'Failed to load your adoptions' }
  }
}

export type MyAdoptionAgreement = NonNullable<Awaited<ReturnType<typeof getMyAdoptionAgreements>>['data']>[number]
