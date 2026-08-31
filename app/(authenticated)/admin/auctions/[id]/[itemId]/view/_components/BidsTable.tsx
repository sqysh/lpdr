import { formatMoney } from 'app/utils/_currency.utils'
import { formatDateTime } from 'app/utils/_date.utils'
import { IAuctionBid } from 'types/_auction-bid'
import { motion } from 'framer-motion'

export function BidsTable({ bids }: { bids: IAuctionBid[] }) {
  const sorted = [...bids].sort((a, b) => b.bidAmount - a.bidAmount)

  return (
    <section
      aria-labelledby="bid-history"
      className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
    >
      <div className="px-4 py-2.5 border-b border-border-light dark:border-border-dark">
        <h3
          id="bid-history"
          className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark"
        >
          Bid History <span className="ml-1 text-primary-light dark:text-primary-dark tabular-nums">{bids.length}</span>
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" aria-label="Bid history">
          <thead>
            <tr className="border-b border-border-light dark:border-border-dark">
              <th
                scope="col"
                className="px-4 py-2.5 text-left text-[9px] font-mono tracking-[0.2em] uppercase font-normal text-muted-light dark:text-muted-dark w-10"
              >
                #
              </th>
              <th
                scope="col"
                className="px-4 py-2.5 text-left text-[9px] font-mono tracking-[0.2em] uppercase font-normal text-muted-light dark:text-muted-dark"
              >
                Bidder
              </th>
              <th
                scope="col"
                className="px-4 py-2.5 text-right text-[9px] font-mono tracking-[0.2em] uppercase font-normal text-muted-light dark:text-muted-dark"
              >
                Amount
              </th>
              <th
                scope="col"
                className="hidden sm:table-cell px-4 py-2.5 text-right text-[9px] font-mono tracking-[0.2em] uppercase font-normal text-muted-light dark:text-muted-dark whitespace-nowrap"
              >
                Time
              </th>
            </tr>
          </thead>
          <motion.tbody
            key="bids"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="divide-y divide-border-light dark:divide-border-dark"
          >
            {sorted.length > 0 ? (
              sorted.map((bid, i) => {
                const name =
                  [bid?.user?.firstName, bid?.user?.lastName].filter(Boolean).join(' ') ||
                  bid?.user?.email ||
                  'Anonymous'
                const isTop = i === 0
                return (
                  <tr
                    key={bid.id}
                    className={
                      isTop
                        ? 'bg-emerald-500/5'
                        : 'hover:bg-primary-light/5 dark:hover:bg-primary-dark/5 transition-colors'
                    }
                  >
                    <td className="px-4 py-2.5">
                      <span
                        className={`text-[10px] font-mono tabular-nums ${isTop ? 'text-emerald-500 font-black' : 'text-muted-light dark:text-muted-dark'}`}
                      >
                        {isTop ? '★' : i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 min-w-0">
                      <p className="text-xs font-mono text-text-light dark:text-text-dark truncate max-w-40 sm:max-w-none">
                        {name}
                      </p>
                      <p className="sm:hidden text-[9px] font-mono text-muted-light dark:text-muted-dark mt-0.5">
                        {formatDateTime(bid.createdAt)}
                      </p>
                    </td>
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      <span
                        className={`text-xs font-black font-mono tabular-nums ${isTop ? 'text-emerald-500' : 'text-text-light dark:text-text-dark'}`}
                      >
                        {formatMoney(bid.bidAmount)}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-4 py-2.5 text-right whitespace-nowrap">
                      <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                        {formatDateTime(bid.createdAt)}
                      </span>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-10 text-center text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark"
                >
                  No bids yet
                </td>
              </tr>
            )}
          </motion.tbody>
        </table>
      </div>
    </section>
  )
}
