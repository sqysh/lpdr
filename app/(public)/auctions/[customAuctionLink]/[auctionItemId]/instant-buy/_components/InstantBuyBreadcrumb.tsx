import Link, { useLinkStatus } from 'next/link'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'

type Props = {
  auctionLink: string
  auctionItemId: string
  auctionTitle: string
}

const CRUMB_CLASS =
  'inline-flex items-center gap-2 text-f10 font-mono uppercase tracking-[0.25em] text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark'

/** useLinkStatus only reports on a navigation, so it has to live inside the Link. */
function CrumbBody({ label, direction }: { label: string; direction: 'back' | 'forward' }) {
  const { pending } = useLinkStatus()

  const icon = pending ? (
    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" aria-hidden="true" />
  ) : direction === 'back' ? (
    <ArrowLeft className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
  ) : (
    <ArrowRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
  )

  return direction === 'back' ? (
    <>
      {icon}
      {label}
    </>
  ) : (
    <>
      {label}
      {icon}
    </>
  )
}

export function InstantBuyBreadcrumb({ auctionLink, auctionItemId, auctionTitle }: Props) {
  return (
    <div className="flex items-center justify-between mb-8">
      <Link href={`/auctions/${auctionLink}/${auctionItemId}`} className={CRUMB_CLASS} aria-label={`Back to ${auctionTitle}`}>
        <CrumbBody label="Back to Auction Item" direction="back" />
      </Link>
      <Link href="/my-pack" className={CRUMB_CLASS}>
        <CrumbBody label="My Pack" direction="forward" />
      </Link>
    </div>
  )
}
