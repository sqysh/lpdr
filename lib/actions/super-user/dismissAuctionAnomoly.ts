'use server'

import prisma from 'prisma/client'

export default async function dismissAuctionAnomaly(id: string) {
  try {
    await prisma.auctionAnomaly.update({
      where: { id },
      data: { dismissed: true }
    })

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
