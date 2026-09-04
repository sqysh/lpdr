'use server'

import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import prisma from 'prisma/client'
import { createLog } from 'lib/actions/log/createLog'
import { WelcomeWienerInputs } from 'types/welcome-wiener'
import { getErrorMessage } from 'lib/utils/error.utils'
import { requireAdmin } from 'lib/auth/guards'

const MAX_NAME = 100

export const createWelcomeWiener = async (input: WelcomeWienerInputs) => {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  const name = input.name?.trim()
  if (!name) return { success: false, error: 'Name is required', data: null }
  if (name.length > MAX_NAME)
    return { success: false, error: `Name must be ${MAX_NAME} characters or fewer`, data: null }

  const bio = input.bio?.trim() || null
  const age = input.age?.trim() || null
  const images = (input.images ?? []).filter(
    (url) => typeof url === 'string' && url.trim().length > 0
  )
  const associatedProducts = input.associatedProducts ?? []

  try {
    const welcomeWiener = await prisma.welcomeWiener.create({
      data: {
        name,
        bio,
        age,
        isLive: input.isLive ?? false,
        images,
        associatedProducts: associatedProducts as unknown as Prisma.InputJsonValue[]
      }
    })

    revalidatePath('/welcomewieners')
    revalidatePath('/admin/welcome-wieners')

    return { success: true, error: null, data: welcomeWiener }
  } catch (error) {
    await createLog('error', 'Failed to create welcome wiener', {
      error: getErrorMessage(error),
      name,
      createdBy: gate.userId
    })
    return {
      success: false,
      error: 'Failed to create welcome wiener. Please try again.',
      data: null
    }
  }
}
