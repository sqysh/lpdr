import prisma from 'prisma/client'

export async function getContentCounts() {
  const [newsletterCount, welcomeWienerCount, productCount] = await Promise.all([
    prisma.newsletter.count(),
    prisma.welcomeWiener.count(),
    prisma.product.count({ where: { isLive: true } })
  ])

  return { newsletterCount, welcomeWienerCount, productCount }
}
