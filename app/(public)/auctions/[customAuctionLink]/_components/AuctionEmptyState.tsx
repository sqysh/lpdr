import { Package } from 'lucide-react'
import { PublicAuction } from 'types/auction.types'

export function AuctionEmptyState({ auction }: { auction: PublicAuction }) {
  if (auction.items.length > 0) return null

  return (
    <section
      aria-labelledby="empty-heading"
      className="border border-border-light dark:border-border-dark py-20 sm:py-24 flex flex-col items-center justify-center gap-5 text-center px-6"
    >
      <div
        className="relative w-14 h-14 border border-border-light dark:border-border-dark flex items-center justify-center"
        aria-hidden="true"
      >
        <Package size={20} className="text-muted-light dark:text-muted-dark" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary-light dark:bg-primary-dark" />
      </div>
      <div>
        <h2 id="empty-heading" className="font-quicksand font-black text-base text-text-light dark:text-text-dark mb-1.5">
          No items yet
        </h2>
        <p className="text-sm font-mono text-muted-light dark:text-muted-dark">Items will appear here once the auction opens.</p>
      </div>
    </section>
  )
}
