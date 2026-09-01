import { SectionLabel } from 'app/components/_primitives'
import { formatMoney } from 'app/utils/_currency.utils'
import { Gavel, TrendingUp, Users } from 'lucide-react'
import { BidRow } from './BidRow'

export function BidHistory({ item, topBid }) {
  return (
    <section aria-labelledby="bids-heading" className="mt-12 sm:mt-16">
      <div className="flex items-center justify-between mb-5">
        <div>
          <SectionLabel className="mb-1">Bid History</SectionLabel>
          <h2
            id="bids-heading"
            className="font-quicksand font-black text-2xl xs:text-3xl text-text-light dark:text-text-dark mt-1"
          >
            {item?.bids.length} Bid{item?.bids.length !== 1 ? 's' : ''}
          </h2>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
          <TrendingUp size={11} className="text-primary-light dark:text-primary-dark" aria-hidden="true" />
          <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
            Top:{' '}
            <span className="text-text-light dark:text-text-dark font-black">
              {topBid ? formatMoney(topBid.bidAmount) : '—'}
            </span>
          </span>
        </div>
      </div>

      <div className="border border-border-light dark:border-border-dark">
        <div className="grid grid-cols-3 gap-px bg-border-light dark:bg-border-dark border-b border-border-light dark:border-border-dark">
          {[
            { icon: TrendingUp, label: 'Top Bid', value: topBid ? formatMoney(topBid.bidAmount) : '—' },
            { icon: Users, label: 'Bidders', value: String(new Set(item?.bids.map((b) => b.userId)).size) },
            { icon: Gavel, label: 'Total Bids', value: String(item?.bids.length) }
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-bg-light dark:bg-bg-dark px-4 py-4">
              <Icon size={11} className="text-muted-light dark:text-muted-dark mb-1.5" aria-hidden="true" />
              <p className="font-mono font-black text-base text-text-light dark:text-text-dark leading-none">{value}</p>
              <p className="text-[9px] font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark mt-1">
                {label}
              </p>
            </div>
          ))}
        </div>

        <div role="list" aria-label="Bid history">
          {item?.bids.map((bid, i) => (
            <div key={bid.id} role="listitem">
              <BidRow bid={bid} rank={i + 1} delay={i * 0.04} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
