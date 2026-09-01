import { SectionLabel } from 'components/_primitives'
import { Zap } from 'lucide-react'
import { AuctionItemCard } from './AuctionItemCard'
import { IAuctionItemLive } from 'types/_auction-item'
import { IAuction } from 'types/_auction'
import { Dispatch, SetStateAction } from 'react'

type Props = {
  isActive: boolean
  available: IAuctionItemLive[]
  auction: IAuction
  customAuctionLink: string
  setFilter: (filter: 'ALL' | 'AUCTION' | 'FIXED' | 'NO BIDS') => void
  filter: string
  setSlotTrigger: Dispatch<SetStateAction<number>>
}

export function AuctionItemGrid({
  isActive,
  available,
  auction,
  customAuctionLink,
  filter,
  setFilter,
  setSlotTrigger
}: Props) {
  return (
    <section aria-labelledby="available-heading">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <SectionLabel>{isActive ? 'Open for Bidding' : 'All Items'}</SectionLabel>
          <h2
            id="available-heading"
            className="font-quicksand font-black text-2xl xs:text-3xl text-text-light dark:text-text-dark"
          >
            {available.length} Item{available.length !== 1 ? 's' : ''}
            {isActive && (
              <span className="ml-3 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" aria-hidden="true" />
                <span className="text-[10px] font-mono text-emerald-500 tracking-[0.15em] uppercase font-normal">
                  Live
                </span>
              </span>
            )}
          </h2>
          <div className="flex items-center gap-px border border-border-light dark:border-border-dark bg-border-light dark:bg-border-dark">
            {(['ALL', 'AUCTION', 'FIXED', 'NO BIDS'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-[9px] font-mono tracking-[0.2em] uppercase transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark ${
                  filter === f
                    ? 'bg-primary-light dark:bg-primary-dark text-white'
                    : 'bg-bg-light dark:bg-bg-dark text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark'
                }`}
              >
                {f === 'ALL'
                  ? 'All'
                  : f === 'AUCTION'
                    ? 'Auction'
                    : f === 'NO BIDS'
                      ? 'No Bids'
                      : 'Buy Now'}
              </button>
            ))}
          </div>
        </div>
        {isActive && (
          <div className="hidden xs:flex items-center gap-1.5 px-3 py-2 border border-emerald-500/30 bg-emerald-500/5">
            <Zap size={10} className="text-emerald-500" aria-hidden="true" />
            <span className="text-[9px] font-mono text-emerald-500 tracking-[0.15em] uppercase">
              Bidding Open
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px items-stretch bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark">
        {available.map((item, i) => (
          <div key={item.id} className="bg-bg-light dark:bg-bg-dark" id={`item-${item.id}`}>
            <AuctionItemCard
              item={item}
              auctionStatus={auction.status}
              index={i}
              customAuctionLink={customAuctionLink}
              onBidSuccess={() => setSlotTrigger((t) => t + 1)}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
