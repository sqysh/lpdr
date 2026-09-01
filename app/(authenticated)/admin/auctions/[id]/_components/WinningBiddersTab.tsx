import { IAuction } from 'types/_auction'
import { motion } from 'framer-motion'
import { Copy } from 'lucide-react'
import { useAuctionUiStore } from 'stores/auction-ui.store'

export function WinningBiddersTab({ auction }: { auction: IAuction }) {
  const openWinningBidderDrawer = useAuctionUiStore((s) => s.openWinningBidderDrawer)
  return (
    <div className="border border-border-light dark:border-border-dark">
      <div className="px-5 py-4 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
        <div className="flex items-center gap-3">
          <span
            className="block w-4 h-px bg-primary-light dark:bg-primary-dark"
            aria-hidden="true"
          />
          <h2 className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
            Winning Bidders <span className="ml-1">{auction.winningBidders.length}</span>
          </h2>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full" aria-label="Winning bidders">
          <thead>
            <tr className="border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
              {['Bidder', 'Items Won', 'Total', 'Payment Status', 'Emails Sent'].map((h) => (
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
            key="winningBidders"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            {auction.winningBidders.length > 0 ? (
              auction.winningBidders.map((bidder) => {
                const name =
                  [bidder.user?.firstName, bidder.user?.lastName].filter(Boolean).join(' ') ||
                  bidder.user?.email ||
                  'Guest'
                return (
                  <tr
                    onClick={() => openWinningBidderDrawer(bidder)}
                    key={bidder.id}
                    className="border-b border-border-light dark:border-border-dark last:border-0 hover:bg-surface-light dark:hover:bg-surface-dark transition-colors"
                  >
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

                    {/* Items won */}
                    <td className="px-5 py-3.5">
                      <div className="space-y-1">
                        {bidder.auctionItems?.map((item) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <span
                              className="block w-1 h-1 shrink-0 bg-primary-light dark:bg-primary-dark"
                              aria-hidden="true"
                            />
                            <p className="text-xs text-text-light dark:text-text-dark truncate max-w-50">
                              {item.name}
                            </p>
                            <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark shrink-0">
                              ${Number(item.soldPrice).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Total */}
                    <td className="px-5 py-3.5">
                      <p className="text-xs font-mono font-semibold text-text-light dark:text-text-dark tabular-nums">
                        ${Number(bidder.totalPrice ?? 0).toLocaleString()}
                      </p>
                      {(bidder.shipping ?? 0) > 0 && (
                        <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-0.5">
                          +${Number(bidder.shipping).toLocaleString()} shipping
                        </p>
                      )}
                    </td>

                    {/* Payment status */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-[9px] font-black tracking-widest uppercase px-2 py-1 ${
                          bidder.winningBidPaymentStatus === 'PAID'
                            ? 'bg-green-500/10 text-green-500'
                            : bidder.winningBidPaymentStatus === 'AWAITING_PAYMENT'
                              ? 'bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark'
                              : 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark'
                        }`}
                      >
                        {bidder.winningBidPaymentStatus?.replace(/_/g, ' ')}
                      </span>
                      {bidder.winningBidPaymentStatus !== 'PAID' && (
                        <button
                          type="button"
                          onClick={() =>
                            navigator.clipboard.writeText(
                              `https://littlepawsdr.org/auctions/winner/${bidder.id}`
                            )
                          }
                          className="flex items-center gap-1.5 mt-1.5 text-[10px] font-mono text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                          aria-label={`Copy payment link for ${name}`}
                        >
                          <Copy className="w-3 h-3 shrink-0" aria-hidden="true" />
                          Copy payment link
                        </button>
                      )}
                    </td>
                    {/* Emails sent */}
                    <td className="px-5 py-3.5">
                      <p className="text-xs font-mono tabular-nums text-text-light dark:text-text-dark">
                        {bidder.emailNotificationCount}
                      </p>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-5 py-16 text-center">
                  <p className="text-xs font-mono text-muted-light dark:text-muted-dark">
                    {auction.status === 'ACTIVE'
                      ? 'Auction is still active.'
                      : 'No winning bidders yet.'}
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
