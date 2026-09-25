'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock } from 'lucide-react'
import { useCountdown } from '@hooks/useCountdown.hook'
import { CountUnit } from 'components/_primitives'

// The hourly cron flips the status on the hour, and may take a moment to run
const REFRESH_AFTER_ZERO_MS = [5_000, 30_000, 90_000, 180_000]

export function AuctionItemCountdown({ date, opens = false }: { date: Date | string; opens?: boolean }) {
  const router = useRouter()
  const { days, hours, minutes, seconds, done } = useCountdown(new Date(date))

  // The fallback for a phone that slept through the auction's Pusher event. Once a refresh brings
  // the new status, the page swaps what this counts to, done goes false and the rest are cancelled
  useEffect(() => {
    if (!done) return
    const timers = REFRESH_AFTER_ZERO_MS.map((ms) => setTimeout(() => router.refresh(), ms))
    return () => timers.forEach(clearTimeout)
  }, [done, router])

  if (done) return null

  return (
    <div className="border border-border-light dark:border-border-dark p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={11} className="text-muted-light dark:text-muted-dark" aria-hidden="true" />
        <span className="text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">
          {opens ? 'Bidding Opens In' : 'Auction Closes In'}
        </span>
      </div>
      <div
        role="timer"
        className="flex items-end gap-5"
        aria-label={`${days} days ${hours} hours ${minutes} minutes ${opens ? 'until bidding opens' : 'remaining'}`}
      >
        {days > 0 && <CountUnit value={days} label="days" size="lg" />}
        <CountUnit value={hours} label="hrs" size="lg" />
        <CountUnit value={minutes} label="min" size="lg" />
        <CountUnit value={seconds} label="sec" size="lg" />
      </div>
    </div>
  )
}
