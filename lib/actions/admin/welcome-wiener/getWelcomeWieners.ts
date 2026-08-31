'use server'

import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'

export async function getWelcomeWieners() {
  try {
    const welcomeWieners = await prisma.welcomeWiener.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return {
      success: true,
      error: null,
      data: welcomeWieners
    }
  } catch (error) {
    await createLog('error', 'Failed to get welcome wieners', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return {
      success: false,
      error: 'Failed to get welcome wieners. Please try again.',
      data: null
    }
  }
}
