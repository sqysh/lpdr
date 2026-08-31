'use server'

import { UpdateAddressInput } from 'types/_address.types'
import prisma from 'prisma/client'
import { createLog } from '../log/createLog'
import { AuthFailure, requireAuth } from '../auth/requireAuth'
import { getErrorMessage } from 'app/utils/_error.utils'

export const updateAddress = async (data: UpdateAddressInput) => {
  const gate = await requireAuth()
  if (!gate.ok) return { success: false, error: (gate as AuthFailure).error, data: null }

  if (!data.addressLine1?.trim() || !data.city?.trim() || !data.zipPostalCode?.trim()) {
    return { success: false, error: 'Address, city, and zip code are required', data: null }
  }

  try {
    await prisma.address.upsert({
      where: { userId: gate.userId },
      update: {
        name: data.name,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        zipPostalCode: data.zipPostalCode,
        country: data.country
      },
      create: {
        name: data.name,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        zipPostalCode: data.zipPostalCode,
        country: data.country,
        userId: gate.userId
      }
    })

    return { success: true, error: null }
  } catch (error) {
    await createLog('error', 'Failed to update address', {
      userId: gate.userId,
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to update address. Please try again.' }
  }
}
