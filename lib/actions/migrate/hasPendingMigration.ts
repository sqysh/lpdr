import prisma from 'prisma/client'

/** True when anything under this email is still waiting in the old-site tables, account or not */
export async function hasPendingMigration(email: string) {
  const where = { email: email.toLowerCase().trim() }
  const select = { email: true }

  const found = await Promise.all([
    prisma.mongoUser.findFirst({ where, select }),
    prisma.mongoDonation.findFirst({ where, select }),
    prisma.mongoOrder.findFirst({ where, select }),
    prisma.mongoAdoptionFee.findFirst({ where, select }),
    prisma.mongoAuctionWinner.findFirst({ where, select }),
    prisma.mongoInstantBuyer.findFirst({ where, select }),
    prisma.mongoBid.findFirst({ where, select }),
    prisma.mongoProductOrder.findFirst({ where, select }),
    prisma.mongoEcardOrder.findFirst({ where, select }),
    prisma.mongoWelcomeWienerOrder.findFirst({ where, select })
  ])

  return found.some(Boolean)
}
