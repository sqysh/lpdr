import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'

export const getWelcomeWienerById = async (id: string) => {
  try {
    const welcomeWiener = await prisma.welcomeWiener.findUnique({
      where: { id }
    })

    return { success: true, data: welcomeWiener }
  } catch (error) {
    await createLog('error', 'Failed to get welcome wiener by id', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id
    })

    return {
      success: false,
      error: 'Failed to get welcome wiener. Please try again.',
      data: null
    }
  }
}
