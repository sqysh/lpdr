'use server'

import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'

export async function getWelcomeWieners() {
  try {
    const welcomeWieners = await prisma.welcomeWiener.findMany({
      where: { archivedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        bio: true,
        age: true,
        images: true,
        associatedProducts: true,
        isPhysicalProduct: true,
        isLive: true
      }
    })

    return { success: true, error: null, data: welcomeWieners }
  } catch (error) {
    await createLog('error', 'Failed to get welcome wieners', { error: getErrorMessage(error) })

    return {
      success: false,
      error: 'Failed to get welcome wieners. Please try again.',
      data: null
    }
  }
}
