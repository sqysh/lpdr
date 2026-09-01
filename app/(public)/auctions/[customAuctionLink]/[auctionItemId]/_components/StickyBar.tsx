import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export function StickyBar({ customAuctionLink, item, isActive, isEnded, days, hours, minutes, seconds, done }) {
  const auctionHref = `/auctions/${customAuctionLink}`

  return (
    <div className="sticky top-0 z-40 border-b border-border-light dark:border-border-dark bg-bg-light/90 dark:bg-bg-dark/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 h-11 flex items-center justify-between gap-4">
        <Link
          href={auctionHref}
          className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.12em] uppercase text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors focus:outline-none focus-visible:underline shrink-0"
          aria-label={`Back to ${item?.auction?.title}`}
        >
          <ArrowLeft size={11} aria-hidden="true" />
          <span className="hidden xs:inline">{item?.auction?.title}</span>
          <span className="xs:hidden">Back</span>
        </Link>

        {isActive && !done && (
          <div
            className="flex items-center gap-1.5 shrink-0"
            aria-live="polite"
            aria-atomic="true"
            aria-label={`${hours} hours ${minutes} minutes ${seconds} seconds remaining`}
          >
            <span className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" aria-hidden="true" />
            <span className="text-[10px] font-mono text-emerald-500 tabular-nums font-black">
              {days > 0 ? `${days}d ` : ''}
              {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
        )}
        {isEnded && (
          <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark shrink-0">Auction Ended</span>
        )}
      </div>
    </div>
  )
}
