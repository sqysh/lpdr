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
  const label = pending ? 'Opening' : isLive ? 'View auction' : 'Preview items'

  return (
    <span className="shrink-0 inline-flex items-center gap-1.5 px-2 py-2 min-[420px]:px-3 bg-white/15 group-hover:bg-white/25 transition-colors text-f10 font-mono tracking-eyebrow uppercase font-black">
      {/* The whole banner is the link, so on a narrow screen the chevron alone is enough of a cue
          and the label's width goes to the heading instead */}
      <span className="hidden min-[420px]:inline">{label}</span>
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
      aria-label={`${heading}. ${detail}`}
      className="group block py-3 text-white bg-linear-to-r from-primary-light via-secondary-light to-primary-light dark:from-primary-dark dark:via-secondary-dark dark:to-primary-dark bg-size-[200%_200%] animate-[gradient-x_8s_ease-in-out_infinite] motion-reduce:animate-none focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
    >
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
          <Gavel size={16} className="shrink-0 mt-px" aria-hidden="true" />
          <div className="min-w-0">
            {/* Wraps rather than truncating: the auction's name is the whole point of the banner */}
            <p className="text-f10 font-mono tracking-eyebrow uppercase font-black leading-snug sm:truncate">{heading}</p>
            <p className="text-f9 font-mono opacity-80 leading-snug mt-0.5 sm:truncate">{detail}</p>
          </div>
        </div>

        <BannerCta isLive={isLive} />
      </div>
    </Link>
  )
}
