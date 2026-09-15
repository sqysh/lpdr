import { useCountdown } from '@hooks/useCountdown.hook'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link, { useLinkStatus } from 'next/link'

export function StickyBarBody({ title }: { title: string }) {
  const { pending } = useLinkStatus()

  return (
    <>
      {pending ? <Loader2 size={11} className="animate-spin" aria-hidden="true" /> : <ArrowLeft size={11} aria-hidden="true" />}
      <span className="hidden xs:inline">{title}</span>
      <span className="xs:hidden">Back</span>
    </>
  )
}

export function AuctionItemStickyBar({ customAuctionLink, item, isActive, isEnded, isDraft }) {
  const auctionHref = `/auctions/${customAuctionLink}`
  const { days, hours, minutes, seconds, done } = useCountdown(new Date(item?.auction?.endDate))
  const isLive = isActive || isDraft

  return (
    <div
      className={`sticky top-0 z-40 border-b border-border-light dark:border-border-dark backdrop-blur-sm ${
        isLive ? 'bg-primary-light/5 dark:bg-primary-dark/5' : 'bg-bg-light/90 dark:bg-bg-dark/90'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 h-11 flex items-center justify-between gap-4">
        <Link
          href={auctionHref}
          className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.12em] uppercase text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors focus:outline-none focus-visible:underline shrink-0"
          aria-label={`Back to ${item?.auction?.title}`}
        >
          <StickyBarBody title={item?.auction?.title} />
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
        {isEnded && <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark shrink-0">Auction Ended</span>}
      </div>
    </div>
  )
}
