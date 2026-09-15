import { formatMoney } from 'lib/utils/currency.utils'
import { formatDateTime } from 'lib/utils/date.utils'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronRight, Trophy } from 'lucide-react'
import { Fragment, useState } from 'react'
import { IAuctionDetail } from 'types/auction.types'

const META = 'text-f10 font-mono text-muted-light dark:text-muted-dark'
const EYEBROW = 'text-f10 font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark'
const PILL = 'text-f9 font-black tracking-widest uppercase px-2 py-0.5'

const COLUMNS = ['', 'Bidder', 'Bids', 'Highest', 'Leading', 'Anonymous', 'Status']

type Bid = IAuctionDetail['bids'][number]

/** Every bid this person placed, newest first, with the item it was on. */
function BidderBidList({ bids, itemName }: { bids: Bid[]; itemName: (id: string) => string }) {
  return (
    <div className="space-y-px">
      {bids.map((bid) => {
        const isTop = bid.status === 'TOP_BID'

        return (
          <div
            key={bid.id}
            className={`flex items-center gap-4 px-3 py-2 border bg-bg-light dark:bg-bg-dark ${
              isTop ? 'border-primary-light/40 dark:border-primary-dark/40' : 'border-border-light dark:border-border-dark'
            }`}
          >
            <span className={`${META} w-36 shrink-0 tabular-nums`}>{formatDateTime(bid.createdAt)}</span>

            <p className="text-xs font-mono text-text-light dark:text-text-dark flex-1 truncate">{itemName(bid.auctionItemId)}</p>

            {isTop && (
              <span
                className={`${PILL} inline-flex items-center gap-1 bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark`}
              >
                <Trophy size={9} aria-hidden="true" />
                Leading
              </span>
            )}

            <span
              className={`text-xs font-mono font-bold tabular-nums w-20 text-right shrink-0 ${
                isTop ? 'text-primary-light dark:text-primary-dark' : 'text-muted-light dark:text-muted-dark'
              }`}
            >
              {formatMoney(Number(bid.bidAmount))}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function BiddersTab({ auction }: { auction: IAuctionDetail }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const itemName = (id: string) => auction.items.find((i) => i.id === id)?.name ?? 'Removed item'

  return (
    <div className="border border-border-light dark:border-border-dark">
      <div className="px-5 py-4 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
        <div className="flex items-center gap-3">
          <span className="block w-4 h-px bg-primary-light dark:bg-primary-dark" aria-hidden="true" />
          <h2 className="text-f10 font-mono tracking-eyebrow uppercase text-primary-light dark:text-primary-dark">
            Bidders <span className="ml-1">{auction.bidders.length}</span>
          </h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" aria-label="Auction bidders">
          <thead>
            <tr className="border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
              {COLUMNS.map((h, i) => (
                <th key={i} scope="col" className={`px-5 py-3 text-left ${EYEBROW}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {auction.bidders.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-5 py-16 text-center">
                  <p className="text-xs font-mono text-muted-light dark:text-muted-dark">No bidders yet.</p>
                </td>
              </tr>
            )}

            {auction.bidders.map((bidder) => {
              const name = [bidder.user?.firstName, bidder.user?.lastName].filter(Boolean).join(' ') || bidder.user?.email || 'Guest'

              // Newest first, so the expanded panel reads as a history rather than a grouping.
              const bids = auction.bids
                .filter((b) => b.userId === bidder.userId)
                .slice()
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

              const itemCount = new Set(bids.map((b) => b.auctionItemId)).size
              const highest = bids.reduce((max, b) => Math.max(max, Number(b.bidAmount)), 0)
              // Status is what placeBid maintains, so it is the answer rather than a name comparison.
              const leading = bids.filter((b) => b.status === 'TOP_BID').length
              const isExpanded = expanded === bidder.id

              return (
                <Fragment key={bidder.id}>
                  <tr
                    className={`border-b border-border-light dark:border-border-dark transition-colors ${
                      isExpanded ? 'bg-surface-light dark:bg-surface-dark' : 'hover:bg-surface-light dark:hover:bg-surface-dark'
                    }`}
                  >
                    <td className="px-5 py-3.5 w-8">
                      <button
                        onClick={() => setExpanded(isExpanded ? null : bidder.id)}
                        aria-label={`${isExpanded ? 'Hide' : 'Show'} every bid from ${name}`}
                        aria-expanded={isExpanded}
                        disabled={bids.length === 0}
                        className="text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                      >
                        {isExpanded ? <ChevronDown size={13} aria-hidden="true" /> : <ChevronRight size={13} aria-hidden="true" />}
                      </button>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="text-xs font-semibold text-text-light dark:text-text-dark">{name}</p>
                      {bidder.user?.email && <p className={`${META} mt-0.5`}>{bidder.user.email}</p>}
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="text-xs font-mono font-bold text-text-light dark:text-text-dark tabular-nums">{bids.length}</span>
                      <span className={`${META} ml-1`}>
                        on {itemCount} item{itemCount !== 1 ? 's' : ''}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="text-xs font-mono font-bold text-text-light dark:text-text-dark tabular-nums">
                        {highest > 0 ? formatMoney(highest) : '—'}
                      </span>
                    </td>

                    {/* How many items they are currently winning, which is the thing an admin
                        actually scans this table for. */}
                    <td className="px-5 py-3.5">
                      {leading > 0 ? (
                        <span
                          className={`${PILL} inline-flex items-center gap-1 bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark`}
                        >
                          <Trophy size={9} aria-hidden="true" />
                          {leading}
                        </span>
                      ) : (
                        <span className={META}>—</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`${PILL} ${
                          bidder.user?.anonymousBidding
                            ? 'bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark'
                            : 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark'
                        }`}
                      >
                        {bidder.user?.anonymousBidding ? 'Yes' : 'No'}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className={META}>{bidder.status}</span>
                    </td>
                  </tr>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                        <td
                          colSpan={COLUMNS.length}
                          className="px-5 pb-4 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
                        >
                          <p className={`${EYEBROW} mb-3 pt-1`}>
                            Every bid from {name}, newest first ({bids.length})
                          </p>
                          <BidderBidList bids={bids} itemName={itemName} />
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
