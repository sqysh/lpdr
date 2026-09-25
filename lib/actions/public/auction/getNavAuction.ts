import prisma from 'prisma/client'

/**
 * The auction shown in the header and nav drawer. Respects isPubliclyVisible,
 * so a draft the crew is still building does not get a public link.
 *
 * ACTIVE sorts before DRAFT, so a live auction always wins over a draft
 * created after it.
 */
export const getNavAuction = async () => {
  return prisma.auction.findFirst({
    where: {
      OR: [{ status: 'ACTIVE' }, { status: 'DRAFT', isPubliclyVisible: true }]
    },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      title: true,
      status: true,
      startDate: true,
      endDate: true,
      customAuctionLink: true,
      isPubliclyVisible: true
    }
  })
}
