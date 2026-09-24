'use server'

import { requireAuth } from 'lib/auth/guards'
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
    if (!owned) return { success: false as const, data: null, error: 'Agreement not found' }

    const agreement = await prisma.adoptionAgreement.findUniqueOrThrow({
      where: { id },
      include: {
        signatures: { select: { role: true, typedName: true, signedAt: true } },
        createdBy: { select: { firstName: true, lastName: true, email: true } }
      }
    })

    const termsSigned = hasSigned(agreement.signatures, 'TERMS_ADOPTER')

    // Before signing, the adopter reads the current terms. After, the agreement shows the edition they signed
    const terms = getAdoptionTerms(termsSigned ? agreement.termsVersion : ADOPTION_TERMS_VERSION)

    return {
      success: true as const,
      error: null,
      data: serialize({
        agreement,
        terms,
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
        paymentInstructions: agreement.paymentMethod === 'CARD' ? null : OFFLINE_PAYMENT_INSTRUCTIONS[agreement.paymentMethod]
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
