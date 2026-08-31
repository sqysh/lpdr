import Link from 'next/link'
import { Eye } from 'lucide-react'

type Props = {
  auctionId: string
  auctionItemId?: string
  isUpdating: boolean
  itemName: string
}

export function AuctionItemFormTitleBand({ auctionId, auctionItemId, isUpdating, itemName }: Props) {
  return (
    <div className="flex items-start justify-between gap-3 flex-wrap pt-6 pb-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5 mb-2 flex-wrap">
          <span className="block w-4 h-px bg-primary-light dark:bg-primary-dark shrink-0" aria-hidden="true" />
          <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
            Auction Item
          </p>
        </div>
        <h2 className="text-xl font-quicksand font-black text-text-light dark:text-text-dark leading-snug truncate">
          {isUpdating ? `Edit ${itemName || 'Item'}` : 'Add Item'}
        </h2>
      </div>

      {isUpdating && auctionItemId && (
        <Link
          href={`/admin/auctions/${auctionId}/${auctionItemId}/view`}
          className="flex items-center gap-2 px-3.5 py-2 border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark text-[10px] font-mono tracking-[0.2em] uppercase hover:text-primary-light dark:hover:text-primary-dark hover:border-primary-light/40 dark:hover:border-primary-dark/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          <Eye size={12} aria-hidden="true" /> View Item
        </Link>
      )}
    </div>
  )
}
