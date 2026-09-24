'use server'

import prisma from 'prisma/client'
import { Prisma } from '@prisma/client'
import { requireAdmin } from 'lib/auth/guards'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { parseInput } from 'lib/utils/validate.utils'
import { pusherSuperuser } from 'lib/pusher/pusher.utils'
import { prepareAdoptionAgreementSchema } from 'lib/schemas/adoption-agreement.schema'
import { ADOPTION_TERMS_VERSION } from 'lib/constants/adoption-agreement.constants'
import type { ActionResult } from 'types/action.types'
import { getDachshundById } from 'lib/actions/_rescue-groups/getDachshundById'
import { parseAdoptionFee } from 'lib/utils/adoption-agreement.utils'

// Statuses where an agreement is still in progress. A second one for the same dog would mean two
// adopters signing for one dachshund
const OPEN_STATUSES = ['DRAFT', 'SENT', 'SIGNED', 'PAID'] as const

export async function createAdoptionAgreement(input: unknown): Promise<ActionResult<{ id: string }>> {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  const parsed = parseInput(prepareAdoptionAgreementSchema, input)
  if (parsed.ok === false) return parsed.result

  const { userId, dogRescueGroupsId, dogColorMarkings, ...details } = parsed.data

  try {
    const adopter = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true, lastName: true, phone: true, address: true }
    })

    if (!adopter?.email) return { success: false, data: null, error: 'That adopter account was not found.' }

    const existing = await prisma.adoptionAgreement.findFirst({
      where: { dogRescueGroupsId, status: { in: [...OPEN_STATUSES] } },
      select: { id: true, status: true }
    })

    if (existing) {
      return { success: false, data: null, error: `This dog already has an agreement in progress (${existing.status.toLowerCase()}).` }
    }

    // The dog comes from RescueGroups, never from the form, so its name and fee can't be altered in the browser
    const dogResult = await getDachshundById(dogRescueGroupsId)
    const dog = dogResult.success ? (dogResult.data?.data?.[0]?.attributes ?? null) : null

    if (!dog) return { success: false, data: null, error: 'That dog could not be found in RescueGroups.' }

    const adoptionFee = parseAdoptionFee(dog.adoptionFeeString)

    if (adoptionFee === null) {
      return {
        success: false,
        data: null,
        error: `${dog.name}'s adoption fee in RescueGroups ("${dog.adoptionFeeString || 'blank'}") isn't an amount. Update it there, then try again.`
      }
    }

    const agreement = await prisma.adoptionAgreement.create({
      data: {
        status: 'DRAFT',
        userId,
        createdById: gate.userId,
        termsVersion: ADOPTION_TERMS_VERSION,

        dogRescueGroupsId,
        dogName: dog.name,
        dogRescueId: dog.rescueId,
        dogSex: dog.sex,
        dogAge: dog.ageString,
        // The admin's entry wins, since the API often leaves color empty
        dogColorMarkings: dogColorMarkings ?? dog.colorDetails ?? null,
        dogPhoto: dog.photos?.[0] ?? null,
        dogSnapshot: dog as unknown as Prisma.InputJsonValue,

        // Prefilled from the account; the adopter confirms or corrects them before signing
        email: adopter.email,
        firstName: adopter.firstName,
        lastName: adopter.lastName,
        phone: adopter.phone,
        addressLine1: adopter.address?.addressLine1 ?? null,
        addressLine2: adopter.address?.addressLine2 ?? null,
        city: adopter.address?.city ?? null,
        state: adopter.address?.state ?? null,
        zipPostalCode: adopter.address?.zipPostalCode ?? null,

        adoptionFee,
        ...details
      },
      select: { id: true }
    })

    const payload = {
      agreementId: agreement.id,
      dogName: dog.name,
      adopterEmail: adopter.email,
      adoptionFee,
      paymentMethod: details.paymentMethod,
      createdBy: gate.userId
    }

    await Promise.all([
      createLog('info', 'Adoption agreement drafted', payload),
      pusherSuperuser('adoption-agreement-drafted', payload).catch((error) =>
        createLog('error', 'Failed to push adoption-agreement-drafted to super feed', {
          agreementId: agreement.id,
          error: getErrorMessage(error)
        })
      )
    ])

    return { success: true, data: { id: agreement.id } }
  } catch (error) {
    await createLog('error', 'Failed to create adoption agreement', {
      dogRescueGroupsId,
      userId,
      error: getErrorMessage(error)
    })

    return { success: false, data: null, error: 'Failed to create the agreement. Please try again.' }
  }
}
