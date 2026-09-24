'use server'

import prisma from 'prisma/client'
import { requireAdmin } from 'lib/auth/guards'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { serialize } from 'lib/utils/serializers.utils'
import { adoptionAgreementDetailArgs, type IAdoptionAgreement } from 'types/adoption-agreement.types'
import type { ActionResult } from 'types/action.types'

export const getAdoptionAgreementById = async (id: string): Promise<ActionResult<IAdoptionAgreement>> => {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  try {
    const agreement = await prisma.adoptionAgreement.findUnique({ where: { id }, ...adoptionAgreementDetailArgs })
    if (!agreement) return { success: false, data: null, error: 'Agreement not found' }

    return { success: true, data: serialize(agreement) }
  } catch (error) {
    await createLog('error', 'Failed to load adoption agreement', { agreementId: id, error: getErrorMessage(error) })
    return { success: false, data: null, error: 'Failed to load the agreement' }
  }
}
