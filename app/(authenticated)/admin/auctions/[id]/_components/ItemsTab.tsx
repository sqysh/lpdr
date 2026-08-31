import { Eye, Package, Pencil, Plus } from 'lucide-react'
import { IAuction } from 'types/_auction'
import { motion } from 'framer-motion'
import { formatMoney } from 'app/utils/_currency.utils'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { getItemStatusConfig } from 'app/utils/_auction.utils'
import Picture from 'app/components/_common/Picture'

export function ItemsTab({ auction }: { auction: IAuction }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const auctionItems = auction.items.filter((i) => i.sellingFormat === 'AUCTION')
  const fixedItems = auction.items.filter((i) => i.sellingFormat === 'FIXED')

  // Derived from the URL — replaces the useState
  const itemTab: 'AUCTION' | 'FIXED' = searchParams.get('type')?.toUpperCase() === 'FIXED' ? 'FIXED' : 'AUCTION'

  const selectItemTab = (tab: 'AUCTION' | 'FIXED') => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('type', tab)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
      {/* ── Header ── */}
      <div className="px-4 py-2.5 border-b border-border-light dark:border-border-dark flex items-center justify-between">
        <h2 className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
          Items{' '}
          <span className="ml-1 text-primary-light dark:text-primary-dark tabular-nums">{auction.items.length}</span>
        </h2>
        <Link
          href={auction.status === 'ENDED' ? '#' : `/admin/auctions/${auction.id}/new?type=${itemTab}`}
          aria-disabled={auction.status === 'ENDED'}
          onClick={auction.status === 'ENDED' ? (e) => e.preventDefault() : undefined}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-mono tracking-[0.2em] uppercase transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark ${
            auction.status === 'ENDED'
              ? 'bg-surface-light dark:bg-surface-dark text-muted-light dark:text-muted-dark border border-border-light dark:border-border-dark cursor-not-allowed opacity-50'
              : 'bg-primary-light dark:bg-primary-dark text-white dark:text-bg-dark hover:bg-secondary-light dark:hover:bg-secondary-dark'
          }`}
        >
          <Plus size={11} aria-hidden="true" /> Add {itemTab === 'AUCTION' ? 'Auction' : 'Instant Buy'} Item
        </Link>
      </div>

      <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark px-4">
        <div role="tablist" aria-label="Item type" className="flex items-center">
          {(['AUCTION', 'FIXED'] as const).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={itemTab === tab}
              onClick={() => selectItemTab(tab)}
              className={`relative px-3.5 py-2.5 text-[9px] font-mono tracking-[0.2em] uppercase transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark ${
                itemTab === tab
                  ? 'text-primary-light dark:text-primary-dark'
                  : 'text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark'
              }`}
            >
              {itemTab === tab && (
                <motion.span
                  layoutId="item-tab-indicator"
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-primary-light dark:bg-primary-dark"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  aria-hidden="true"
                />
              )}
              {tab === 'AUCTION' ? 'Auction' : 'Instant Buy'}
              <span className="ml-2 tabular-nums text-muted-light dark:text-muted-dark">
                {tab === 'AUCTION' ? auctionItems.length : fixedItems.length}
              </span>
            </button>
          ))}
        </div>
        <p className="hidden sm:block text-[9px] font-mono text-muted-light dark:text-muted-dark">
          The selected tab sets the type of item you create
        </p>
      </div>

      {/* ── Tables ── */}
      {(['AUCTION', 'FIXED'] as const).map((tab) => (
        <div key={tab} hidden={itemTab !== tab} className="overflow-x-auto">
          <table className="w-full" aria-label={`${tab === 'AUCTION' ? 'Auction' : 'Instant buy'} items`}>
            <thead>
              <tr className="border-b border-border-light dark:border-border-dark">
                {(tab === 'AUCTION'
                  ? ['Item', 'Bids', 'Starting', 'Current Bid', 'Increase', 'Shipping', 'Status', '']
                  : ['Item', 'Price', 'Quantity', 'Sold', 'Shipping', 'Status', '']
                ).map((h, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="px-4 py-2.5 text-left text-[9px] font-mono tracking-[0.2em] uppercase font-normal text-muted-light dark:text-muted-dark whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {(tab === 'AUCTION' ? auctionItems : fixedItems).map((item) => {
                const itemStatus = getItemStatusConfig(item.status)
                const increase =
                  item.startingPrice != null && item.currentBid != null && item.currentBid > item.startingPrice
                    ? {
                        amount: item.currentBid - item.startingPrice,
                        pct: ((item.currentBid - item.startingPrice) / item.startingPrice) * 100
                      }
                    : null

                return (
                  <tr
                    key={item.id}
                    className="group hover:bg-primary-light/5 dark:hover:bg-primary-dark/5 transition-colors"
                  >
                    {/* Item — photo + name + description */}
                    <td className="px-4 py-2.5 min-w-0">
                      <div className="flex items-center gap-2.5">
                        {item.photos?.length > 0 ? (
                          <Picture
                            priority={false}
                            src={item.photos.find((p) => p.isPrimary)?.url ?? item.photos[0].url}
                            alt=""
                            className="w-8 h-8 object-cover border border-border-light dark:border-border-dark shrink-0"
                          />
                        ) : (
                          <div
                            className="w-8 h-8 bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark flex items-center justify-center shrink-0"
                            aria-hidden="true"
                          >
                            <Package size={12} className="text-muted-light dark:text-muted-dark" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-text-light dark:text-text-dark truncate max-w-50">
                            {item.name}
                          </p>
                          {item.description && (
                            <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark truncate max-w-50">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {tab === 'AUCTION' ? (
                      <>
                        <td className="px-4 py-2.5 text-xs font-mono tabular-nums text-text-light dark:text-text-dark whitespace-nowrap">
                          {item.totalBids}
                        </td>
                        <td className="px-4 py-2.5 text-xs font-mono tabular-nums text-text-light dark:text-text-dark whitespace-nowrap">
                          {formatMoney(item.startingPrice)}
                        </td>
                        <td className="px-4 py-2.5 text-xs font-black font-mono tabular-nums text-text-light dark:text-text-dark whitespace-nowrap">
                          {formatMoney(item.currentBid)}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          {increase ? (
                            <>
                              <p className="text-xs font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                                +{formatMoney(increase.amount)}
                              </p>
                              <p className="text-[10px] font-mono tabular-nums text-emerald-600/70 dark:text-emerald-400/70">
                                ({increase.pct.toFixed(1)}%)
                              </p>
                            </>
                          ) : (
                            <span className="text-xs font-mono text-muted-light dark:text-muted-dark">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-xs font-mono tabular-nums text-muted-light dark:text-muted-dark whitespace-nowrap">
                          {item.requiresShipping ? formatMoney(item.shippingCosts) : '—'}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-2.5 text-xs font-mono tabular-nums text-text-light dark:text-text-dark whitespace-nowrap">
                          {formatMoney(item.buyNowPrice)}
                        </td>
                        <td className="px-4 py-2.5 text-xs font-mono tabular-nums text-muted-light dark:text-muted-dark whitespace-nowrap">
                          {item.totalQuantity ?? '—'}
                        </td>
                        <td className="px-4 py-2.5 text-xs font-mono tabular-nums text-muted-light dark:text-muted-dark whitespace-nowrap">
                          {item.instantBuyers?.length ?? 0}
                        </td>
                        <td className="px-4 py-2.5 text-xs font-mono tabular-nums text-muted-light dark:text-muted-dark whitespace-nowrap">
                          {item.requiresShipping ? formatMoney(item.shippingCosts) : '—'}
                        </td>
                      </>
                    )}

                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span
                        className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 ${itemStatus.classes}`}
                      >
                        {itemStatus.label}
                      </span>
                    </td>

                    {/* Actions — view / edit / delete */}
                    <td className="px-4 py-2.5 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          href={`/admin/auctions/${item.auctionId}/${item.id}/view`}
                          aria-label={`View ${item.name} and its bids`}
                          className="p-1.5 text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                        >
                          <Eye size={13} aria-hidden="true" />
                        </Link>
                        <Link
                          href={auction.status === 'ENDED' ? '#' : `/admin/auctions/${item.auctionId}/${item.id}/edit`}
                          aria-label={
                            auction.status === 'ENDED'
                              ? `Cannot edit ${item.name} — auction has ended`
                              : `Edit ${item.name}`
                          }
                          aria-disabled={auction.status === 'ENDED'}
                          onClick={auction.status === 'ENDED' ? (e) => e.preventDefault() : undefined}
                          className={`p-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark ${
                            auction.status === 'ENDED'
                              ? 'text-muted-light/30 dark:text-muted-dark/30 cursor-not-allowed'
                              : 'text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark'
                          }`}
                        >
                          <Pencil size={13} aria-hidden="true" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {(tab === 'AUCTION' ? auctionItems : fixedItems).length === 0 && (
                <tr>
                  <td
                    colSpan={tab === 'AUCTION' ? 8 : 7}
                    className="px-4 py-12 text-center text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark"
                  >
                    No {tab === 'AUCTION' ? 'auction' : 'instant buy'} items yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
