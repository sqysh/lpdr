import Link from 'next/link'

type Props = {
  auctionLink: string
  auctionItemId: string
  auctionTitle: string
}

export function InstantBuyBreadcrumb({ auctionLink, auctionItemId, auctionTitle }: Props) {
  return (
    <div className="flex items-center justify-between mb-8">
      <Link
        href={`/auctions/${auctionLink}/${auctionItemId}`}
        className="inline-flex items-center gap-2 text-f10 uppercase tracking-[0.25em] text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors"
        aria-label={`Back to ${auctionTitle}`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Auction Item
      </Link>
      <Link
        href=" /my-pack"
        className="inline-flex items-center gap-2 text-f10 uppercase tracking-[0.25em] text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors"
      >
        My Pack
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  )
}
