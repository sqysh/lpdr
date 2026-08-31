'use server'

import prisma from 'prisma/client'
import { Prisma } from '@prisma/client'
import { WelcomeWienerInputs } from 'types/_welcome-wiener'
import { createLog } from '../../log/createLog'
import { AdminFailure, requireAdmin } from '../../auth/requireAdmin'
import { getErrorMessage } from 'app/utils/_error.utils'

export const updateWelcomeWiener = async (id: string, input: Partial<WelcomeWienerInputs>) => {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, error: (gate as AdminFailure).error, data: null }

  if (input.name != null && !input.name.trim()) {
    return { success: false, error: 'Name is required', data: null }
  }

  try {
    const welcomeWiener = await prisma.welcomeWiener.update({
      where: { id },
      data: {
        ...(input.name != null && { name: input.name.trim() }),
        ...(input.bio != null && { bio: input.bio }),
        ...(input.age != null && { age: input.age }),
        ...(input.isLive != null && { isLive: input.isLive }),
        ...(input.images != null && { images: input.images }),
        ...(input.associatedProducts != null && {
          associatedProducts: input.associatedProducts as unknown as Prisma.InputJsonValue[]
        })
      }
    })

    return { success: true, data: welcomeWiener, error: null }
  } catch (error) {
    await createLog('error', 'Failed to update welcome wiener', {
      error: getErrorMessage(error),
      welcomeWienerId: id,
      updatedBy: gate.userId
    })
    return { success: false, error: 'Failed to update welcome wiener. Please try again.', data: null }
  }
}
