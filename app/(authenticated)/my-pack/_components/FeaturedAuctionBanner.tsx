'use client'

import Link, { useLinkStatus } from 'next/link'
import { ChevronRight, Gavel, Loader2 } from 'lucide-react'
import { formatDate } from 'lib/utils/date.utils'

type Props = {
  title: string
  customAuctionLink: string
  startDate: Date | string | null
  endDate: Date | string
  itemCount: number
  /** Status decides this, not the dates, since the hourly cron can leave a draft sitting just past its start time */
  isLive: boolean
  /** Set when this pack member already has a bid in the auction, so the copy can nudge rather than invite. */
  hasBids?: boolean
}

function BannerCta({ isLive }: { isLive: boolean }) {
  const { pending } = useLinkStatus()

  return (
    <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 transition-colors text-f10 font-mono tracking-eyebrow uppercase font-black">
      {pending ? 'Opening' : isLive ? 'View auction' : 'Preview items'}
      {pending ? (
        <Loader2 size={12} className="animate-spin" aria-hidden="true" />
      ) : (
        <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
      )}
    </span>
  )
}

export function FeaturedAuctionBanner({ title, customAuctionLink, startDate, endDate, itemCount, isLive, hasBids }: Props) {
  const items = `${itemCount} item${itemCount === 1 ? '' : 's'}`

  const heading = !isLive ? `${title} opens soon` : hasBids ? `You are bidding in ${title}` : `${title} is live`
  const detail = isLive
    ? `${items} up for bidding, ends ${formatDate(endDate)}`
    : startDate
      ? `${items} to preview, bidding opens ${formatDate(startDate)}`
      : `${items} to preview`

  return (
    <Link
      href={`/auctions/${customAuctionLink}`}
      // The gradient drifts rather than pulses, so it reads as alive without competing with the
      // page. bg-size-[200%_200%] is what gives the gradient-x keyframes somewhere to travel.
      className="group flex items-center justify-between gap-4 px-4 py-3 text-white bg-linear-to-r from-primary-light via-secondary-light to-primary-light dark:from-primary-dark dark:via-secondary-dark dark:to-primary-dark bg-size-[200%_200%] animate-[gradient-x_8s_ease-in-out_infinite] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
    >
      <div className="flex items-center gap-3 min-w-0">
        <Gavel size={16} className="shrink-0" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-f10 font-mono tracking-eyebrow uppercase font-black truncate">{heading}</p>
          <p className="text-f9 font-mono opacity-80 truncate">{detail}</p>
        </div>
      </div>

      <BannerCta isLive={isLive} />
    </Link>
  )
}
