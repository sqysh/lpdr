import { Package } from 'lucide-react'
import { IAuction } from 'types/_auction'

export function AuctionEmptyState({ auction }: { auction: IAuction }) {
  if (auction.items.length > 0) return

  return (
    <div className="border border-border-light dark:border-border-dark py-24 flex flex-col items-center justify-center gap-5 text-center px-6">
      <div className="relative w-14 h-14 border border-border-light dark:border-border-dark flex items-center justify-center">
        <Package size={20} className="text-muted-light dark:text-muted-dark" aria-hidden="true" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-light dark:bg-primary-dark" aria-hidden="true" />
      </div>
      <div>
        <p className="font-quicksand font-black text-base text-text-light dark:text-text-dark mb-1.5">No items yet</p>
        <p className="text-xs font-mono text-muted-light dark:text-muted-dark">
          Items will appear here once the auction opens.
        </p>
      </div>
    </div>
  )
}
