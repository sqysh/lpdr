import prisma from 'prisma/client'

export async function getWelcomeWienerRevenue() {
  const wieners = await prisma.welcomeWiener.findMany({
    where: { isLive: true },
    select: {
      id: true,
      name: true,
      orderItems: {
        where: { order: { status: 'CONFIRMED' }, itemType: 'WELCOME_WIENER' },
        select: { totalPrice: true, quantity: true }
      }
    }
  })

  return wieners.map((w) => ({
    id: w.id,
    name: w.name ?? 'Unnamed',
    totalRaised: w.orderItems.reduce((sum, item) => sum + Number(item.totalPrice ?? 0), 0),
    sponsorCount: w.orderItems.length
  }))
}
