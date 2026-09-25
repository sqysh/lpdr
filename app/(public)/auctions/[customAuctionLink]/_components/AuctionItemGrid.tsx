import { Zap } from 'lucide-react'
import { SectionLabel } from 'components/_primitives'
import { AuctionItemCard } from './auction-item-card/AuctionItemCard'
import { PublicAuction, PublicAuctionListItem } from 'types/auction.types'
import { MyBid } from 'lib/actions/public/auction/getMyBidsForAuction'
import { AUCTION_FILTER_LABELS, AUCTION_FILTERS, AuctionFilter, EMPTY_MESSAGE } from '../_lib/auction-filters'

type Props = {
  isActive: boolean
  available: PublicAuctionListItem[]
  auction: PublicAuction
  customAuctionLink: string
  setFilter: (filter: AuctionFilter) => void
  filter: AuctionFilter
  counts: Record<AuctionFilter, number>
  myBids: Record<string, MyBid>
  isAuthed: boolean
}

export function AuctionItemGrid({ isActive, available, auction, customAuctionLink, filter, setFilter, counts, myBids, isAuthed }: Props) {
  // Hidden: a filter with nothing in it, and Auction when every item is one, since it would match All.
  // The selected filter always stays, so it can't vanish from under someone when a bid moves them out of it
  const options = AUCTION_FILTERS.filter(
    (f) => f === 'ALL' || f === filter || (counts[f] > 0 && !(f === 'AUCTION' && counts.AUCTION === counts.ALL))
  )
  const showFilters = options.length > 1

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

      {showFilters && (
        <div className="sticky top-12 z-30 -mx-4 xs:-mx-5 sm:mx-0 mb-5 py-2 bg-bg-light/90 dark:bg-bg-dark/90 backdrop-blur-sm">
          <div
            role="group"
            aria-label="Filter items"
            className="flex gap-2 overflow-x-auto px-4 xs:px-5 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {options.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={`shrink-0 h-10 px-3.5 flex items-center gap-1.5 border text-[11px] font-mono tracking-tag uppercase whitespace-nowrap transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark ${
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
        </div>
      )}

      {/* Tells screen readers what a filter change did, since the list swaps silently otherwise */}
      <p className="sr-only" role="status">
        Showing {available.length} of {counts.ALL} items
      </p>

      {available.length === 0 ? (
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
          className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px items-stretch bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark"
        >
          {available.map((item, i) => (
            <li key={item.id} id={`item-${item.id}`} className="bg-bg-light dark:bg-bg-dark scroll-mt-28">
              <AuctionItemCard
                item={item}
                auctionStatus={auction.status}
                index={i}
                customAuctionLink={customAuctionLink}
                myBid={myBids[item.id] ?? null}
                isAuthed={isAuthed}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
