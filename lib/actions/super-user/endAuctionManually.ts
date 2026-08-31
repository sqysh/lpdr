'use server'

import { createLog } from 'lib/actions/log/createLog'
import { endAuctionCore } from 'app/api/cron/end-auction/route'
import { AdminFailure, requireAdmin } from '../auth/requireAdmin'

export async function endAuctionManually(auctionId: string) {
  // TEMP: requireAdmin instead of requireSuper — widened for LPDR crew testing period.
  // REVERT to requireSuper before going live with real Stripe keys.
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, error: (gate as AdminFailure).error }

  await createLog('info', 'Auction ended manually', { auctionId, by: gate.userId })
  return endAuctionCore(auctionId)
}
