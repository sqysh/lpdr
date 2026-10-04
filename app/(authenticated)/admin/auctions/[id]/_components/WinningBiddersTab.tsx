'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy } from 'lucide-react'
import { IAuctionDetail } from 'types/auction.types'
import { formatMoney } from 'lib/utils/currency.utils'
import { MarkWinnerPaidButton } from './MarkWinnerPaidButton'

const COLUMNS = ['Bidder', 'Items Won', 'Total', 'Payment Status', 'Emails Sent']

function CopyPaymentLink({ bidderId, name }: { bidderId: string; name: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_SITE_URL}/auctions/winner/${bidderId}`)
    // Confirms it reached the clipboard before it gets pasted into a text or email
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy payment link for ${name}`}
      className="flex items-center gap-1.5 mt-1.5 min-h-8 text-[10px] font-mono text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
    >
      {copied ? (
        <Check className="w-3 h-3 shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
      ) : (
        <Copy className="w-3 h-3 shrink-0" aria-hidden="true" />
      )}
      <span aria-live="polite">{copied ? 'Copied' : 'Copy payment link'}</span>
    </button>
  )
}

export function WinningBiddersTab({ auction }: { auction: IAuctionDetail }) {
  return (
    <div className="border border-border-light dark:border-border-dark">
      <div className="px-5 py-4 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
        <div className="flex items-center gap-3">
          <span className="block w-4 h-px bg-primary-light dark:bg-primary-dark" aria-hidden="true" />
          <h2 className="text-[10px] font-mono tracking-eyebrow uppercase text-primary-light dark:text-primary-dark">
            Winning Bidders <span className="ml-1">{auction.winningBidders.length}</span>
          </h2>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full" aria-label="Winning bidders">
          <thead>
            <tr className="border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
              {COLUMNS.map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-5 py-3 text-left text-[10px] font-mono tracking-tag uppercase text-muted-light dark:text-muted-dark"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <motion.tbody key="winningBidders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
            {auction.winningBidders.length > 0 ? (
              auction.winningBidders.map((bidder) => {
                const name = [bidder.user?.firstName, bidder.user?.lastName].filter(Boolean).join(' ') || bidder.user?.email || 'Guest'
                const paid = bidder.winningBidPaymentStatus === 'PAID'

                return (
                  <tr key={bidder.id} className="border-b border-border-light dark:border-border-dark last:border-0">
                    <td className="px-5 py-3.5">
                      <p className="text-xs font-semibold text-text-light dark:text-text-dark">{name}</p>
                      {bidder.user?.email && (
                        <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-0.5">{bidder.user.email}</p>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <ul className="space-y-1">
                        {bidder.auctionItems?.map((item) => (
                          <li key={item.id} className="flex items-center gap-2">
                            <span className="block w-1 h-1 shrink-0 bg-primary-light dark:bg-primary-dark" aria-hidden="true" />
                            <p className="text-xs text-text-light dark:text-text-dark truncate max-w-50">{item.name}</p>
                            <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark shrink-0">
                              {formatMoney(Number(item.soldPrice ?? 0))}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="text-xs font-mono font-semibold text-text-light dark:text-text-dark tabular-nums">
                        {formatMoney(Number(bidder.totalPrice ?? 0))}
                      </p>
                      {Number(bidder.shipping ?? 0) > 0 && (
                        <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-0.5">
                          +{formatMoney(Number(bidder.shipping))} shipping
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`text-[10px] font-black tracking-widest uppercase px-2 py-1 ${
                          paid
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            : bidder.winningBidPaymentStatus === 'AWAITING_PAYMENT'
                              ? 'bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark'
                              : 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark'
                        }`}
                      >
                        {bidder.winningBidPaymentStatus?.replace(/_/g, ' ')}
                      </span>
                      {!paid && (
                        <>
                          <CopyPaymentLink bidderId={bidder.id} name={name} />
                          <MarkWinnerPaidButton winningBidderId={bidder.id} name={name} total={Number(bidder.totalPrice ?? 0)} />
                        </>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="text-xs font-mono tabular-nums text-text-light dark:text-text-dark">{bidder.emailNotificationCount}</p>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-16 text-center">
                  <p className="text-xs font-mono text-muted-light dark:text-muted-dark">
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
