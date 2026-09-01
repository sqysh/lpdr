'use server'

import { createLog } from 'lib/actions/log/createLog'
import { endAuctionCore } from 'app/api/cron/end-auction/route'
import { requireSuper } from 'lib/auth/guards'

export async function endAuctionManually(auctionId: string) {
  // REVERT to requireSuper before going live with real Stripe keys.
  const gate = await requireSuper()
  if (gate.ok === false) return { success: false, error: gate.error }

  await createLog('info', 'Auction ended manually', { auctionId, by: gate.userId })
  return endAuctionCore(auctionId)
}
