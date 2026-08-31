'use server'

import prisma from 'prisma/client'

export default async function createAuctionAnomaly({
  auctionId,
  type,
  itemId,
  itemName,
  message,
  metadata
}: {
  auctionId: string
  type: string
  itemId: string
  itemName: string
  message: string
  metadata?: Record<string, unknown>
}) {
  try {
    const anomaly = await prisma.auctionAnomaly.create({
      data: {
        auctionId,
        type,
        itemId,
        itemName,
        message,
        metadata: metadata ? JSON.stringify(metadata) : undefined
      }
    })

    return { success: true, data: anomaly }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
