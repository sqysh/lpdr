import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { requireAuth } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import { serialize } from 'lib/utils/serializers.utils'
import { auctionWinningBidderArgs } from 'types/auction.types'

/** Enough to say whose link it is without printing someone's address in full. */
const maskEmail = (email: string) => {
  const [name, domain] = email.split('@')
  if (!domain) return 'another account'
  return `${name.slice(0, 2)}${'•'.repeat(Math.max(name.length - 2, 1))}@${domain}`
}

export const getAuctionWinningBidderById = async (id: string) => {
  const gate = await requireAuth()
  if (gate.ok === false) return { success: false, error: gate.error, code: 'UNAUTHENTICATED' as const, data: null }

  try {
    const winningBidder = await prisma.auctionWinningBidder.findUnique({
      where: { id },
      ...auctionWinningBidderArgs
    })

    if (!winningBidder) return { success: false, error: 'Not found', code: 'NOT_FOUND' as const, data: null }

    // Payment links get opened on shared computers and forwarded between partners, so landing
    // here signed in as someone else is ordinary rather than suspicious. The page needs to be
    // able to say which account the link belongs to, so the mismatch is its own case.
    if (winningBidder.userId !== gate.userId) {
      await createLog('info', 'Winner payment link opened by another account', {
        winningBidderId: id,
        signedInAs: gate.userId,
        belongsTo: winningBidder.userId
      })

      return {
        success: false,
        error: 'This payment link belongs to a different account',
        code: 'WRONG_ACCOUNT' as const,
        data: null,
        meta: { belongsTo: maskEmail(winningBidder.user.email ?? '') }
      }
    }

    return { success: true, error: null, code: null, data: serialize(winningBidder) }
  } catch (error) {
    await createLog('error', 'Failed to fetch auction winning bidder', { id, error: getErrorMessage(error) })
    return { success: false, error: 'Failed to fetch data', code: 'ERROR' as const, data: null }
  }
}
