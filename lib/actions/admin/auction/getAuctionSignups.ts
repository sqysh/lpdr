'use server'

import prisma from 'prisma/client'
import { requireAdmin } from 'lib/auth/guards'

export type AuctionSignups = {
  newAccounts: number
  newBidders: number
}

/**
 * Accounts created while the auction was running. Two numbers rather than one: the window
 * catches everyone who signed up in that period, including people who came for something else
 * entirely, so the bidder count is the one that is actually attributable to the auction.
 */
export async function getAuctionSignups(auctionId: string): Promise<AuctionSignups> {
  const gate = await requireAdmin()
  if (gate.ok === false) return { newAccounts: 0, newBidders: 0 }

  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    select: { startDate: true, endDate: true }
  })

  if (!auction) return { newAccounts: 0, newBidders: 0 }

  // An auction still running has an end date in the future, so this reads as "so far".
  const window = { gte: auction.startDate, lte: auction.endDate }

  const [newAccounts, newBidders] = await Promise.all([
    prisma.user.count({ where: { createdAt: window } }),
    prisma.user.count({
      where: {
        createdAt: window,
        bidder: { some: { auctionId } }
      }
    })
  ])

  return { newAccounts, newBidders }
}
