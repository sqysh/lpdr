'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy } from 'lucide-react'
import { IAuctionDetail } from 'types/auction.types'
import { formatMoney } from 'lib/utils/currency.utils'
import { MarkWinnerPaidButton } from './MarkWinnerPaidButton'

const COLUMNS = ['Bidder', 'Items', 'Total', 'Status', '']

type Winner = IAuctionDetail['winningBidders'][number]

const muted = 'text-muted-light dark:text-muted-dark'

// Only orders from this auction's close onward, so an earlier auction's attempts don't show
function paymentNote(winner: Winner, endedAt: Date): { text: string; tone: string; title?: string } | null {
  const user = winner.user
  const attempts = (user?.orders ?? []).filter((o) => new Date(o.createdAt) >= endedAt)
  const charged = attempts.find((o) => o.autoPaid && o.status === 'CONFIRMED')
  const declined = attempts.find((o) => o.status === 'FAILED')

  if (charged) return { text: 'Auto-pay charged', tone: 'text-emerald-700 dark:text-emerald-400' }

  // Covers both a declined auto-pay at close and a winner whose card failed on the winner page
  if (declined && winner.winningBidPaymentStatus !== 'PAID') {
    return {
      text: 'Payment declined',
      tone: 'text-red-600 dark:text-red-400',
      title: declined.failureReason ?? 'No reason given'
    }
  }

  if (!user?.autoPay) return null

  const missing = user._count.paymentMethods === 0 ? 'no saved card' : !user.address ? 'no address' : null
  if (missing) return { text: `Auto-pay skipped, ${missing}`, tone: 'text-amber-600 dark:text-amber-400' }
  return { text: 'Auto-pay on', tone: muted }
}

function CopyPaymentLink({ bidderId, name }: { bidderId: string; name: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_SITE_URL}/auctions/winner/${bidderId}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy payment link for ${name}`}
      className={`flex items-center gap-1.5 min-h-8 text-[10px] font-mono ${muted} hover:text-primary-light dark:hover:text-primary-dark transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark`}
    >
      {copied ? (
        <Check className="w-3 h-3 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
      ) : (
        <Copy className="w-3 h-3 shrink-0" aria-hidden="true" />
      )}
      <span aria-live="polite">{copied ? 'Copied' : 'Copy link'}</span>
    </button>
  )
}

export function WinningBiddersTab({ auction }: { auction: IAuctionDetail }) {
  const endedAt = new Date(auction.endDate)
  const winners = [...auction.winningBidders].sort(
    (a, b) => Number(a.winningBidPaymentStatus === 'PAID') - Number(b.winningBidPaymentStatus === 'PAID')
  )
  const unpaid = winners.filter((w) => w.winningBidPaymentStatus !== 'PAID')
  const outstanding = unpaid.reduce((sum, w) => sum + Number(w.totalPrice ?? 0), 0)

  return (
    <div className="border border-border-light dark:border-border-dark">
      <div className="px-5 py-4 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="block w-4 h-px bg-primary-light dark:bg-primary-dark" aria-hidden="true" />
          <h2 className="text-[10px] font-mono tracking-eyebrow uppercase text-primary-light dark:text-primary-dark">
            Winning Bidders <span className="ml-1">{winners.length}</span>
          </h2>
        </div>
        {winners.length > 0 && (
          <p className={`text-[10px] font-mono ${muted}`}>
            {winners.length - unpaid.length} paid · {unpaid.length} awaiting · {formatMoney(outstanding)} outstanding
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" aria-label="Winning bidders">
          <thead>
            <tr className="border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
              {COLUMNS.map((h, i) => (
                <th key={h || i} scope="col" className={`px-4 py-2.5 text-left text-[10px] font-mono tracking-tag uppercase ${muted}`}>
                  {h || <span className="sr-only">Actions</span>}
                </th>
              ))}
            </tr>
          </thead>
          <motion.tbody key="winningBidders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
            {winners.length > 0 ? (
              winners.map((bidder) => {
                const name = [bidder.user?.firstName, bidder.user?.lastName].filter(Boolean).join(' ') || bidder.user?.email || 'Guest'
                const paid = bidder.winningBidPaymentStatus === 'PAID'
                const items = bidder.auctionItems ?? []
                const shipping = Number(bidder.shipping ?? 0)
                const note = paymentNote(bidder, endedAt)
                const reminders = bidder.emailNotificationCount ?? 0
                const itemsTitle = items.map((i) => `${i.name} (${formatMoney(Number(i.soldPrice ?? 0))})`).join('\n')

                return (
                  <tr
                    key={bidder.id}
                    className="border-b border-border-light dark:border-border-dark last:border-0 hover:bg-surface-light/50 dark:hover:bg-surface-dark/50"
                  >
                    <td className="px-4 py-2.5 max-w-52">
                      <p className="text-xs font-semibold text-text-light dark:text-text-dark truncate">{name}</p>
                      {bidder.user?.email && <p className={`text-[10px] font-mono ${muted} truncate`}>{bidder.user.email}</p>}
                    </td>

                    <td className="px-4 py-2.5 max-w-64" title={itemsTitle}>
                      <p className="text-xs text-text-light dark:text-text-dark truncate">{items.map((i) => i.name).join(', ')}</p>
                      {items.length > 1 && <p className={`text-[10px] font-mono ${muted}`}>{items.length} items</p>}
                    </td>

                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <p className="text-xs font-mono font-semibold tabular-nums text-text-light dark:text-text-dark">
                        {formatMoney(Number(bidder.totalPrice ?? 0))}
                      </p>
                      {shipping > 0 && <p className={`text-[10px] font-mono ${muted}`}>incl. {formatMoney(shipping)} shipping</p>}
                    </td>

                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span
                        className={`inline-block text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 ${
                          paid
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            : bidder.winningBidPaymentStatus === 'AWAITING_PAYMENT'
                              ? 'bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark'
                              : `border border-border-light dark:border-border-dark ${muted}`
                        }`}
                      >
                        {bidder.winningBidPaymentStatus?.replace(/_/g, ' ')}
                      </span>
                      {(note || reminders > 0) && (
                        <p className="text-[10px] font-mono mt-0.5" title={note?.title}>
                          {note && <span className={note.tone}>{note.text}</span>}
                          {note && reminders > 0 && <span className={muted}> · </span>}
                          {reminders > 0 && (
                            <span className={muted}>
                              {reminders} reminder{reminders === 1 ? '' : 's'}
                            </span>
                          )}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-2.5">
                      {!paid && (
                        <div className="flex items-center justify-end gap-4 whitespace-nowrap">
                          <CopyPaymentLink bidderId={bidder.id} name={name} />
                          <MarkWinnerPaidButton winningBidderId={bidder.id} name={name} total={Number(bidder.totalPrice ?? 0)} />
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-16 text-center">
                  <p className={`text-xs font-mono ${muted}`}>
                    {auction.status === 'ACTIVE' ? 'Auction is still active.' : 'No winning bidders yet.'}
                  </p>
                </td>
              </tr>
            )}
          </motion.tbody>
        </table>
      </div>
    </div>
  )
}
