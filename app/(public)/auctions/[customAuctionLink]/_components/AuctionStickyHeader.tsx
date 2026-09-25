import { LinkSpinner } from 'components/_common/LinkSpinner'
import Link from 'next/link'
import { Role } from '@prisma/client'
import { useAuctionUiStore } from 'stores/auction-ui.store'
import { PublicAuction } from 'types/auction.types'

const ACTION =
  'flex items-center gap-1.5 h-12 px-1 text-f10 font-mono tracking-eyebrow uppercase text-primary-light dark:text-primary-dark hover:text-secondary-light dark:hover:text-secondary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark'

const Arrow = () => <span aria-hidden="true">→</span>

type Props = {
  auction: PublicAuction
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

function Divider() {
  return <span className="w-px h-3.5 bg-border-light dark:bg-border-dark" aria-hidden="true" />
}

export function AuctionStickyHeader({ auction, isActive, done, days, hours, minutes, seconds, isEnded, isAuthed, isDraft }: Props) {
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
            // A copy of the timer in the header band below, so screen readers only hear that one
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span
                className={`w-1.5 h-1.5 motion-safe:animate-pulse ${isActive ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-primary-light dark:bg-primary-dark'}`}
              />
              <span
                className={`text-f10 font-mono tabular-nums ${isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-primary-light dark:text-primary-dark'}`}
              >
                {isDraft && 'Opens in '}
                {days > 0 ? `${days}d ` : ''}
                {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>
          )}

          {isEnded && <span className="text-f10 font-mono text-muted-light dark:text-muted-dark">Auction Ended</span>}

          {isLive && (
            <>
              <Divider />
              {isAuthed ? (
                <Link href="/my-pack" className={ACTION}>
                  <LinkSpinner label="My Pack" />
                  <Arrow />
                </Link>
              ) : (
                <button type="button" onClick={() => openSignInModal(`/auctions/${auction.customAuctionLink}`)} className={ACTION}>
                  Sign in <Arrow />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
