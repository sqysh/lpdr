'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { LinkBody } from 'components/_common/LinkBody'
import { HeroAuction } from './Hero'

// Eastern on both server and client so the date range renders the same during hydration
const dayFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' })

const toMs = (d: Date | string | null) => (d ? new Date(d).getTime() : null)

function getTimeLeft(targetMs: number | null, now: number) {
  const diff = targetMs ? targetMs - now : 0
  if (diff <= 0) return null

  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000)
  }
}

function useAuctionCountdown(auction: HeroAuction) {
  // Status decides the phase, not the clock. Crons are hourly, so the auction can still be DRAFT just past startDate
  const isLive = auction.status === 'ACTIVE'
  const startMs = toMs(auction.startDate)
  const endMs = toMs(auction.endDate)
  const target = isLive ? endMs : startMs

  // Only the clock lives in state. Time left is derived, so a new target shows on the very next render
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const time = getTimeLeft(target, now)
  const label = isLive ? (time ? 'Bidding closes in' : 'Closing now') : time ? 'Bidding opens in' : 'Opening now'
  const cta = isLive ? 'Bid now' : 'Preview'
  const range = startMs && endMs ? `${dayFmt.format(startMs)}–${dayFmt.format(endMs)}` : null
  const units = [
    { value: time?.days ?? 0, label: 'Days' },
    { value: time?.hours ?? 0, label: 'Hours' },
    { value: time?.minutes ?? 0, label: 'Mins' },
    { value: time?.seconds ?? 0, label: 'Secs' }
  ]

  return { label, cta, range, units, href: `/auctions/${auction.customAuctionLink}` }
}

export function AuctionCountdown({ auction, variant = 'stacked' }: { auction: HeroAuction; variant?: 'stacked' | 'horizontal' }) {
  const { label, cta, range, units, href } = useAuctionCountdown(auction)

  if (variant === 'horizontal') {
    return (
      <Link
        href={href}
        aria-label={`${cta}: ${auction.title}`}
        className="group flex items-center gap-3 w-full px-3 min-[400px]:px-4 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
      >
        <div className="flex flex-col min-w-0 shrink">
          <p className="text-f9 min-[400px]:text-f10 font-mono tracking-tag uppercase text-primary-light dark:text-primary-dark leading-none truncate">
            {auction.title}
          </p>
          <p
            suppressHydrationWarning
            className="hidden min-[380px]:block text-[9px] font-nunito text-muted-light dark:text-muted-dark leading-none mt-1 truncate"
          >
            {label}
            {range && ` · ${range}`}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {units.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center">
              <p
                suppressHydrationWarning
                className="font-sora font-black text-[15px] min-[400px]:text-[17px] text-primary-light dark:text-primary-dark tabular-nums leading-none"
              >
                {String(value).padStart(2, '0')}
              </p>
              <p className="text-[7px] font-mono tracking-wider uppercase text-muted-light dark:text-muted-dark mt-0.5 leading-none">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* The strip is the tap target now, so this is a visual cue only and can show on standard phone widths */}
        <span className="hidden min-[360px]:inline-flex items-center justify-center gap-1 shrink-0 px-3 py-1.5 border border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark text-[9px] font-mono tracking-tag uppercase group-hover:bg-primary-light dark:group-hover:bg-primary-dark group-hover:text-white dark:group-hover:text-bg-dark transition-colors duration-200">
          <LinkBody icon={<ArrowRight className="w-2.5 h-2.5" aria-hidden="true" />} label={cta} spinnerClass="w-2.5 h-2.5" />
        </span>
      </Link>
    )
  }

  return (
    <div className="w-full text-center">
      <p className="text-f10 font-mono tracking-eyebrow uppercase text-primary-light dark:text-primary-dark mb-1">{auction.title}</p>
      <p
        suppressHydrationWarning
        className="text-[10px] 1200:text-[11px] font-nunito text-muted-light dark:text-muted-dark mb-3 1200:mb-4 leading-snug"
      >
        {label}
        {range && ` · ${range}`}
      </p>
      <div className="grid grid-cols-4 gap-1.5 1200:gap-2 mb-3 1200:mb-4">
        {units.map(({ value, label }) => (
          <div
            key={label}
            className="flex flex-col items-center border border-border-light dark:border-border-dark px-1 1200:px-2 py-1.5 1200:py-2"
          >
            <p
              suppressHydrationWarning
              className="font-sora font-black text-[20px] 1200:text-[28px] text-primary-light dark:text-primary-dark tabular-nums leading-none"
            >
              {String(value).padStart(2, '0')}
            </p>
            <p className="text-f9 font-mono tracking-wider 1200:tracking-widest uppercase text-muted-light dark:text-muted-dark mt-1">
              {label}
            </p>
          </div>
        ))}
      </div>

      <Link
        href={href}
        className="inline-flex items-center justify-center w-full gap-2 px-4 py-2 border border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark text-[10px] font-mono tracking-eyebrow uppercase hover:bg-primary-light dark:hover:bg-primary-dark hover:text-white dark:hover:text-bg-dark transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2"
      >
        <LinkBody icon={<ArrowRight className="w-3 h-3" aria-hidden="true" />} label={cta} />
      </Link>
    </div>
  )
}
