import { Gavel, Tag } from 'lucide-react'

export function AuctionItemCardBadgeStrip({ isEnded, isSold, isUpcoming, item }) {
  const ribbonLabel = isSold ? 'Sold' : isEnded ? 'Ended' : isUpcoming ? 'Upcoming' : null
  return (
    <div className="absolute top-3 left-3 z-10 flex items-stretch bg-bg-light/90 dark:bg-bg-dark/90 backdrop-blur-sm border border-border-light dark:border-border-dark">
      <div className="px-2 py-1 flex items-center gap-1.5">
        {item.sellingFormat === 'FIXED' ? (
          <Tag size={9} aria-hidden="true" className="text-muted-light dark:text-muted-dark" />
        ) : (
          <Gavel size={9} aria-hidden="true" className="text-primary-light dark:text-primary-dark" />
        )}
        <span
          className={`text-[9px] font-mono tracking-eyebrow uppercase font-black ${
            item.sellingFormat === 'FIXED' ? 'text-muted-light dark:text-muted-dark' : 'text-primary-light dark:text-primary-dark'
          }`}
        >
          {item.sellingFormat === 'FIXED' ? 'Buy Now' : 'Auction'}
        </span>
      </div>

      {ribbonLabel && (
        <div className="px-2 py-1 flex items-center border-l border-border-light dark:border-border-dark">
          <span
            className={`text-[9px] font-mono tracking-eyebrow uppercase font-black ${
              isSold
                ? 'text-emerald-500'
                : isUpcoming
                  ? 'text-primary-light dark:text-primary-dark'
                  : 'text-muted-light dark:text-muted-dark'
            }`}
          >
            {ribbonLabel}
          </span>
        </div>
      )}
    </div>
  )
}
