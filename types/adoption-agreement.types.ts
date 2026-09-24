import { Prisma } from '@prisma/client'
import { DecimalToNumber } from './prisma.types'

/** Admin agreements table: enough to list and filter, no medical detail or snapshot. */
export const adoptionAgreementListArgs = Prisma.validator<Prisma.AdoptionAgreementDefaultArgs>()({
  select: {
    id: true,
    status: true,
    dogName: true,
    dogRescueId: true,
    dogPhoto: true,
    firstName: true,
    lastName: true,
    email: true,
    adoptionFee: true,
    healthCertificateFee: true,
    additionalDonation: true,
    paymentMethod: true,
    emailFailedAt: true,
    sentAt: true,
    paidAt: true,
    createdAt: true,
    updatedAt: true,
    createdBy: { select: { firstName: true, lastName: true } }
  }
})

export type IAdoptionAgreementRow = DecimalToNumber<Prisma.AdoptionAgreementGetPayload<typeof adoptionAgreementListArgs>>

/** Admin agreement detail: everything on the agreement plus who is involved and what was signed. */
export const adoptionAgreementDetailArgs = Prisma.validator<Prisma.AdoptionAgreementDefaultArgs>()({
  include: {
    user: {
      select: {
        id: true,
        email: true,
        // The application fee they paid before applying; a separate payment, shown for the full picture
        adoptionFees: { select: { feeAmount: true, createdAt: true, orderId: true }, orderBy: { createdAt: 'desc' }, take: 1 }
      }
    },
    createdBy: { select: { firstName: true, lastName: true, email: true } },
    markedPaidBy: { select: { firstName: true, lastName: true } },
    signatures: { select: { role: true, typedName: true, signedAt: true, ipAddress: true }, orderBy: { signedAt: 'asc' } },
    order: {
      select: {
        id: true,
        totalAmount: true,
        feesCovered: true,
        coverFees: true,
        paymentIntentId: true,
        refundedAmount: true,
        refundedAt: true
      }
    }
  }
})

export type IAdoptionAgreement = DecimalToNumber<Prisma.AdoptionAgreementGetPayload<typeof adoptionAgreementDetailArgs>>
