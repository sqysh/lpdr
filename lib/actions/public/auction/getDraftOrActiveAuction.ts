'use server'

import prisma from 'prisma/client'

export default async function getDraftOrActiveAuction() {
  try {
    const auction = await prisma.auction.findFirst({
      where: {
        status: { in: ['ACTIVE', 'DRAFT'] }
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        startDate: true,
        endDate: true,
        customAuctionLink: true
      }
    })

    return { success: true, data: auction }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
