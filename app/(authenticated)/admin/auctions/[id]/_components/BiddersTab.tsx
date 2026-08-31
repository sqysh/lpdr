import { formatMoney } from 'app/utils/_currency.utils'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Fragment, useState } from 'react'
import { IAuction } from 'types/_auction'
import { IAuctionItem } from 'types/_auction-item'

export function BiddersTab({ auction }: { auction: IAuction }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="border border-border-light dark:border-border-dark">
      <div className="px-5 py-4 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
        <div className="flex items-center gap-3">
          <span
            className="block w-4 h-px bg-primary-light dark:bg-primary-dark"
            aria-hidden="true"
          />
          <h2 className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
            Bidders <span className="ml-1">{auction.bidders.length}</span>
          </h2>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" aria-label="Auction bidders">
          <thead>
            <tr className="border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
              {['', 'Bidder', 'Total Bids', 'Top Bid', 'Anonymous', 'Status'].map((h) => (
                <th
                  key={h}
                  scope="col"
                  className="px-5 py-3 text-left text-[10px] font-mono tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <motion.tbody
            key="bidders"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            {auction.bidders.length > 0 ? (
              auction.bidders.map((bidder, i) => {
                const name =
                  [bidder.user?.firstName, bidder.user?.lastName].filter(Boolean).join(' ') ||
                  bidder.user?.email ||
                  'Guest'
                const bidderBids = auction.bids.filter((b) => b.userId === bidder.user.id)
                const topBid = bidderBids.reduce((max, b) => Math.max(max, Number(b.bidAmount)), 0)
                const biddedItems = [...new Set(bidderBids.map((b) => b.auctionItemId))]
                  .map((itemId) => auction.items.find((i) => i.id === itemId))
                  .filter(Boolean) as IAuctionItem[]
                const isExpanded = expanded === bidder.id

                return (
                  <Fragment key={i}>
                    <tr
                      key={bidder.id}
                      className={`border-b border-border-light dark:border-border-dark last:border-0 transition-colors ${
                        isExpanded
                          ? 'bg-surface-light dark:bg-surface-dark'
                          : 'hover:bg-surface-light dark:hover:bg-surface-dark'
                      }`}
                    >
                      {/* Expand toggle */}
                      <td className="px-5 py-3.5 w-8">
                        <button
                          onClick={() => setExpanded(isExpanded ? null : bidder.id)}
                          aria-label={
                            isExpanded ? 'Collapse bidder details' : 'Expand bidder details'
                          }
                          aria-expanded={isExpanded}
                          className="text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                        >
                          {isExpanded ? (
                            <ChevronDown size={13} aria-hidden="true" />
                          ) : (
                            <ChevronRight size={13} aria-hidden="true" />
                          )}
                        </button>
                      </td>

                      {/* Bidder */}
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-semibold text-text-light dark:text-text-dark">
                          {name}
                        </p>
                        {bidder.user?.email && (
                          <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-0.5">
                            {bidder.user.email}
                          </p>
                        )}
                      </td>

                      {/* Total bids */}
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-mono font-bold text-text-light dark:text-text-dark">
                          {bidderBids.length}
                        </span>
                        <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark ml-1">
                          across {biddedItems.length} item{biddedItems.length !== 1 ? 's' : ''}
                        </span>
                      </td>

                      {/* Top bid */}
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-mono font-bold text-primary-light dark:text-primary-dark">
                          {topBid > 0 ? formatMoney(topBid) : '—'}
                        </span>
                      </td>

                      {/* Anonymous */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-[9px] font-black tracking-widest uppercase px-2 py-1 ${
                            bidder.user?.anonymousBidding
                              ? 'bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark'
                              : 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark'
                          }`}
                        >
                          {bidder.user?.anonymousBidding ? 'Yes' : 'No'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                          {bidder.status}
                        </span>
                      </td>
                    </tr>

                    {/* Expanded — items bid on */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.tr
                          key={`${bidder.id}-expanded`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                        >
                          <td
                            colSpan={6}
                            className="px-5 pb-4 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
                          >
                            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-3 pt-1">
                              Items Bid On
                            </p>
                            <div className="space-y-1">
                              {biddedItems.map((item) => {
                                const itemBids = bidderBids.filter(
                                  (b) => b.auctionItemId === item.id
                                )
                                const itemTopBid = Math.max(
                                  ...itemBids.map((b) => Number(b.bidAmount))
                                )
                                const isTopBidder =
                                  item.topBidder === bidder.user?.name ? 'Anonymous' : name
                                return (
                                  <div
                                    key={item.id}
                                    className="flex items-center gap-4 px-3 py-2 border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark"
                                  >
                                    <p className="text-xs font-mono text-text-light dark:text-text-dark flex-1 truncate">
                                      {item.name}
                                    </p>
                                    <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                                      {itemBids.length} bid{itemBids.length !== 1 ? 's' : ''}
                                    </span>
                                    <span className="text-[10px] font-mono font-bold text-primary-light dark:text-primary-dark tabular-nums">
                                      {formatMoney(itemTopBid)}
                                    </span>
                                    {isTopBidder && (
                                      <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark">
                                        Top Bidder
                                      </span>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </Fragment>
                )
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <p className="text-xs font-mono text-muted-light dark:text-muted-dark">
                    No bidders yet.
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
