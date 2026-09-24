'use server'

import prisma from 'prisma/client'
import { requireAdmin } from 'lib/auth/guards'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { serialize } from 'lib/utils/serializers.utils'
import { adoptionAgreementListArgs, type IAdoptionAgreementRow } from 'types/adoption-agreement.types'
import type { ActionResult } from 'types/action.types'

export const getAdoptionAgreements = async (): Promise<ActionResult<IAdoptionAgreementRow[]>> => {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  try {
    const agreements = await prisma.adoptionAgreement.findMany({
      ...adoptionAgreementListArgs,
      // Most recently touched first, so whatever just moved is at the top
      orderBy: { updatedAt: 'desc' }
    })

    return { success: true, data: serialize(agreements) }
  } catch (error) {
    await createLog('error', 'Failed to load adoption agreements', { loadedBy: gate.userId, error: getErrorMessage(error) })
    return { success: false, data: null, error: 'Failed to load agreements' }
  }
}
