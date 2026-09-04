import Link from 'next/link'
import { useAuctionUiStore } from 'stores/auction-ui.store'
import { IAuction } from 'types/auction.types'

type Props = {
  auction: IAuction
  isActive: boolean
  done: boolean
  days: number
  hours: number
  minutes: number
  seconds: number
  isEnded: boolean
  isAuthed: boolean
  isDraft: boolean
}

export function StickyHeader({ auction, isActive, done, days, hours, minutes, seconds, isEnded, isAuthed, isDraft }: Props) {
  const openSignInModal = useAuctionUiStore((s) => s.openSignInModal)
  const isLive = isActive || isDraft

  return (
    <div
      className={`sticky top-0 z-40 border-b border-border-light dark:border-border-dark backdrop-blur-sm ${
        isLive ? 'bg-primary-light/5 dark:bg-primary-dark/5' : 'bg-bg-light/90 dark:bg-bg-dark/90'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 h-12 flex items-center gap-4">
        <p className="flex-1 text-xs font-quicksand font-black text-text-light dark:text-text-dark truncate">{auction.title}</p>

        <div className="flex items-center gap-4 shrink-0">
          {isLive && !done && (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" aria-hidden="true" />
              <span className="text-[10px] font-mono text-emerald-500 tabular-nums">
                {days > 0 ? `${days}d ` : ''}
                {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>
          )}

          {isEnded && <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark">Auction Ended</span>}

          {isLive && (
            <>
              <span className="w-px h-3.5 bg-border-light dark:bg-border-dark" aria-hidden="true" />
              {isAuthed ? (
                <Link
                  href="/my-pack"
                  className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark hover:text-secondary-light dark:hover:text-secondary-dark transition-colors"
                >
                  Member →
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => openSignInModal(`/auctions/${auction.customAuctionLink}`)}
                  className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark hover:text-secondary-light dark:hover:text-secondary-dark transition-colors"
                >
                  Sign in →
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
