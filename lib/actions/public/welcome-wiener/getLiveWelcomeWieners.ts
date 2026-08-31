import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { IWelcomeWiener, WelcomeWienerProduct } from 'types/_welcome-wiener'

export const getLiveWelcomeWieners = async () => {
  try {
    const welcomeWieners = await prisma.welcomeWiener.findMany({
      where: { isLive: true },
      orderBy: { createdAt: 'desc' }
    })

    const serializeWiener = (w: any): IWelcomeWiener => ({
      ...w,
      associatedProducts: w.associatedProducts as unknown as WelcomeWienerProduct[]
    })

    return {
      success: true,
      data: welcomeWieners.map(serializeWiener),
      error: null
    }
  } catch (error) {
    await createLog('error', 'Failed to get live welcome wieners', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return {
      success: false,
      error: 'Failed to get live welcome wieners. Please try again.',
      data: null
    }
  }
}
