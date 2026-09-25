import { Tag } from 'lucide-react'

/**
 * Only what's true of this item and not the whole auction: Buy Now, since nearly everything is an
 * auction, and Sold. Status like upcoming or ended is already said by the page header.
 */
export function AuctionItemCardBadgeStrip({ isSold, item }) {
  const isFixed = item.sellingFormat === 'FIXED'
  if (!isFixed && !isSold) return null

  return (
    <div className="absolute top-2.5 left-2.5 z-10 flex items-stretch bg-bg-light/90 dark:bg-bg-dark/90 backdrop-blur-sm border border-border-light dark:border-border-dark">
      {isFixed && (
        <span className="px-2 py-1 flex items-center gap-1.5 text-[10px] font-mono tracking-tag uppercase font-black text-text-light dark:text-text-dark">
          <Tag size={10} aria-hidden="true" />
          Buy Now
        </span>
      )}
      {isSold && (
        <span
          className={`px-2 py-1 flex items-center text-[10px] font-mono tracking-tag uppercase font-black text-emerald-700 dark:text-emerald-400 ${
            isFixed ? 'border-l border-border-light dark:border-border-dark' : ''
          }`}
        >
          Sold
        </span>
      )}
    </div>
  )
}
