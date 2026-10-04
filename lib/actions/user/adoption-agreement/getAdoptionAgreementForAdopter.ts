'use server'

import { requireAdmin, requireAuth } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import prisma from 'prisma/client'
import { ADOPTION_TERMS_VERSION, getAdoptionTerms, OFFLINE_PAYMENT_INSTRUCTIONS } from 'lib/constants/adoption-agreement.constants'
import { findOwnedAgreement, hasSigned } from 'lib/adoption-agreement/agreement-access'
import { serialize } from 'lib/utils/serializers.utils'
import { createLog } from 'lib/actions/log/createLog'

export async function getAdoptionAgreementForAdopter(id: string) {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false as const, data: null, error: gate.error }

  try {
    const owned = await findOwnedAgreement(id, gate.userId)

    // Admins can read any agreement, drafts included, to see exactly what the adopter sees. Read only:
    // the sign actions still go through findOwnedAgreement, so an admin can never sign on someone's behalf
    const readOnly = !owned && (await requireAdmin()).ok
    if (!owned && !readOnly) return { success: false as const, data: null, error: 'Agreement not found' }

    const agreement = await prisma.adoptionAgreement.findUnique({
      where: { id },
      include: {
        signatures: { select: { role: true, typedName: true, signedAt: true } },
        createdBy: { select: { firstName: true, lastName: true, email: true } }
      }
    })

    // Deleted, or an admin following a link to one that no longer exists
    if (!agreement) return { success: false as const, data: null, error: 'Agreement not found' }

    const termsSigned = hasSigned(agreement.signatures, 'TERMS_ADOPTER')

    // Before signing, the adopter reads the current terms. After, the agreement shows the edition they signed
    const terms = getAdoptionTerms(termsSigned ? agreement.termsVersion : ADOPTION_TERMS_VERSION)

    return {
      success: true as const,
      error: null,
      data: serialize({
        agreement,
        terms,
        readOnly,
        steps: {
          detailsComplete: !!(
            agreement.firstName &&
            agreement.lastName &&
            agreement.phone &&
            agreement.addressLine1 &&
            agreement.city &&
            agreement.state &&
            agreement.zipPostalCode
          ),
          termsSigned,
          financialSigned: hasSigned(agreement.signatures, 'FINANCIAL_FIRST_ADOPTER')
        },
        // Shown once signed, for anyone paying outside the site
        paymentInstructions:
          agreement.paymentMethod && agreement.paymentMethod !== 'CARD' ? OFFLINE_PAYMENT_INSTRUCTIONS[agreement.paymentMethod] : null
      })
    }
  } catch (error) {
    await createLog('error', 'Failed to load adoption agreement for adopter', {
      agreementId: id,
      userId: gate.userId,
      error: getErrorMessage(error)
    })
    return { success: false as const, data: null, error: 'Failed to load the agreement. Please try again.' }
  }
}
