import { Zap } from 'lucide-react'
import { SectionLabel } from 'components/_primitives'
import { AuctionItemCard } from './auction-item-card/AuctionItemCard'
import { PublicAuction, PublicAuctionListItem } from 'types/auction.types'
import { MyBid } from 'lib/actions/public/auction/getMyBidsForAuction'
import {
  AUCTION_FILTER_LABELS,
  AUCTION_FILTERS,
  AUCTION_SORT_LABELS,
  AUCTION_SORTS,
  AuctionFilter,
  AuctionSort,
  EMPTY_MESSAGE,
  matchesFilter,
  sortItems
} from '../_lib/auction-filters'
import { useState } from 'react'

export function AuctionItemGrid({
  isActive,
  available,
  auction,
  customAuctionLink,
  myBids
}: {
  isActive: boolean
  available: PublicAuctionListItem[]
  auction: PublicAuction
  customAuctionLink: string
  myBids: Record<string, MyBid>
}) {
  const [filter, setFilter] = useState<AuctionFilter>('ALL')
  const [sort, setSort] = useState<AuctionSort>('DEFAULT')

  const counts = Object.fromEntries(
    AUCTION_FILTERS.map((f) => [f, available.filter((item) => matchesFilter(item, f, myBids)).length])
  ) as Record<AuctionFilter, number>

  // Hidden: a filter with nothing in it, and Auction when every item is one, since it would match All.
  // The selected filter always stays, so it can't vanish from under someone when a bid moves them out of it
  const options = AUCTION_FILTERS.filter(
    (f) => f === 'ALL' || f === filter || (counts[f] > 0 && !(f === 'AUCTION' && counts.AUCTION === counts.ALL))
  )
  const showFilters = options.length > 1

  const filtered = sortItems(
    available.filter((item) => matchesFilter(item, filter, myBids)),
    sort
  )

  return (
    <section aria-labelledby="available-heading">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div className="space-y-1.5">
          <SectionLabel>{isActive ? 'Open for Bidding' : 'All Items'}</SectionLabel>
          <h2 id="available-heading" className="font-quicksand font-black text-2xl xs:text-3xl text-text-light dark:text-text-dark">
            {counts.ALL} Item{counts.ALL !== 1 ? 's' : ''}
          </h2>
        </div>
        {isActive && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 border border-emerald-600/30 dark:border-emerald-500/30 bg-emerald-500/5">
            <Zap size={11} className="text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 tracking-tag uppercase">Bidding Open</span>
          </div>
        )}
      </div>
      <div className="sticky top-12 z-30 -mx-4 xs:-mx-5 sm:mx-0 mb-5 py-2 bg-bg-light/90 dark:bg-bg-dark/90 backdrop-blur-sm">
        <div className="flex items-center gap-2 pr-4 xs:pr-5 sm:pr-0">
          {showFilters && (
            <div
              role="group"
              aria-label="Filter items"
              className="flex-1 min-w-0 h-10 flex items-center gap-2 overflow-x-auto overflow-y-hidden pl-4 xs:pl-5 sm:pl-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {options.map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                  className={`shrink-0 h-10 px-3.5 flex items-center gap-1.5 border text-[11px] font-mono tracking-tag uppercase whitespace-nowrap transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark ${
                    filter === f
                      ? 'bg-primary-light dark:bg-primary-dark border-primary-light dark:border-primary-dark text-white'
                      : 'bg-bg-light dark:bg-bg-dark border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark'
                  }`}
                >
                  {AUCTION_FILTER_LABELS[f]}
                  <span className={`tabular-nums ${filter === f ? 'text-white/80' : 'text-muted-light/70 dark:text-muted-dark/70'}`}>
                    {counts[f]}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Outside the scrolling row, so it's always in reach; a native select opens the phone's own picker */}
          <label className={`relative shrink-0 flex items-center ${showFilters ? '' : 'ml-auto pl-4 xs:pl-5 sm:pl-0'}`}>
            <span className="sr-only">Sort items</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as AuctionSort)}
              className="h-10 appearance-none pl-3 pr-8 border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-base sm:text-[11px] font-mono sm:tracking-tag sm:uppercase text-text-light dark:text-text-dark cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              {AUCTION_SORTS.map((s) => (
                <option key={s} value={s}>
                  {AUCTION_SORT_LABELS[s]}
                </option>
              ))}
            </select>
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-light dark:text-muted-dark"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </label>
        </div>
      </div>

      {/* Tells screen readers what a filter change did, since the list swaps silently otherwise */}
      <p className="sr-only" role="status">
        Showing {filtered.length} of {counts.ALL} items
      </p>

      {filtered.length === 0 ? (
        <div className="border border-border-light dark:border-border-dark py-14 px-6 text-center space-y-3">
          <p className="font-quicksand font-black text-lg text-text-light dark:text-text-dark">Nothing here right now</p>
          <p className="text-sm text-muted-light dark:text-muted-dark">{EMPTY_MESSAGE[filter] ?? 'No items match this filter.'}</p>
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className="inline-flex items-center h-11 px-5 border border-border-light dark:border-border-dark text-[11px] font-mono tracking-tag uppercase text-text-light dark:text-text-dark hover:border-primary-light dark:hover:border-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            Show all items
          </button>
        </div>
      ) : (
        <ul
          role="list"
          // Lines come from each card's own right and bottom borders, so a part-filled last row leaves empty
          // cells blank instead of filled with the line color
          className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch border-t border-l border-border-light dark:border-border-dark"
        >
          {filtered.map((item, i) => (
            <li
              key={item.id}
              id={`item-${item.id}`}
              className="bg-bg-light dark:bg-bg-dark border-r border-b border-border-light dark:border-border-dark scroll-mt-28"
            >
              <AuctionItemCard
                item={item}
                auctionStatus={auction.status}
                index={i}
                customAuctionLink={customAuctionLink}
                myBid={myBids[item.id] ?? null}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
