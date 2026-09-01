import Link from 'next/link'
import { setOpenAuctionSignInModal } from 'lib/store/slices/uiSlice'
import { useAppDispatch } from 'lib/store/store'
import { IAuction } from 'types/_auction'

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
}

export function StickyHeader({
  auction,
  isActive,
  done,
  days,
  hours,
  minutes,
  seconds,
  isEnded,
  isAuthed
}: Props) {
  const dispatch = useAppDispatch()

  return (
    <div className="sticky top-0 z-40 border-b border-border-light dark:border-border-dark bg-bg-light/90 dark:bg-bg-dark/90 backdrop-blur-sm">
      {isActive && (
        <div className="border-b border-border-light dark:border-border-dark bg-primary-light/5 dark:bg-primary-dark/5 px-4 xs:px-5 sm:px-6 py-2 flex items-center justify-between gap-3">
          {isAuthed ? (
            <>
              <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                Track your bids and manage your account
              </p>
              <Link
                href=" /my-pack"
                className="shrink-0 text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark hover:text-secondary-light dark:hover:text-secondary-dark transition-colors"
              >
                Member →
              </Link>
            </>
          ) : (
            <>
              <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                Sign in to place bids and track your items
              </p>
              <button
                onClick={() =>
                  dispatch(setOpenAuctionSignInModal(`/auctions/${auction.customAuctionLink}`))
                }
                className="shrink-0 text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark hover:text-secondary-light dark:hover:text-secondary-dark transition-colors"
              >
                Sign in →
              </button>
            </>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 h-12 flex items-center justify-between gap-4">
        <p className="text-xs font-quicksand font-black text-text-light dark:text-text-dark truncate">
          {auction.title}
        </p>
        {isActive && !done && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" aria-hidden="true" />
            <span className="text-[10px] font-mono text-emerald-500 tabular-nums">
              {days > 0 ? `${days}d ` : ''}
              {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:
              {String(seconds).padStart(2, '0')}
            </span>
          </div>
        )}
        {isEnded && (
          <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark shrink-0">
            Auction Ended
          </span>
        )}
      </div>
    </div>
  )
}
