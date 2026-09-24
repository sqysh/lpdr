'use server'

import { requireAdmin } from 'lib/auth/guards'
import { createLog } from '../../log/createLog'
import { getErrorMessage } from 'lib/utils/error.utils'
import { stripeClient } from 'lib/stripe/stripe-client'
import { applyChargeRefund } from 'lib/stripe/webhooks/handleChargeRefunded'
import type { ActionResult } from 'types/action.types'

// Far enough back to cover anything refunded before refunds were recorded automatically
const LOOKBACK_DAYS = 365

/** Catches the site up on refunds made in Stripe that it never heard about. Only changes orders that don't already match. */
export async function syncRefundsFromStripe(): Promise<ActionResult<{ checked: number; updated: number }>> {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  try {
    const since = Math.floor((Date.now() - LOOKBACK_DAYS * 86_400_000) / 1000)
    let checked = 0
    let updated = 0

    for await (const charge of stripeClient.charges.list({ created: { gte: since }, limit: 100 })) {
      if (charge.amount_refunded === 0) continue
      checked += 1
      if (await applyChargeRefund(charge)) updated += 1
    }

    await createLog('info', 'Refunds synced from Stripe', { checked, updated, syncedBy: gate.userId })

    return { success: true, data: { checked, updated } }
  } catch (error) {
    await createLog('error', 'Failed to sync refunds from Stripe', { error: getErrorMessage(error) })
    return { success: false, data: null, error: 'Failed to sync with Stripe. Please try again.' }
  }
}
