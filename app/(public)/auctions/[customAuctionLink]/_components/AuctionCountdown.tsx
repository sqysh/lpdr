'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCountdown } from 'lib/hooks/useCountdown.hook'
import { PublicAuction } from 'types/auction.types'
import { AuctionStickyHeader, AuctionHeaderBand } from './index'
import { Role } from '@prisma/client'

type Props = {
  auction: PublicAuction
  isActive: boolean
  isEnded: boolean
  isAuthed: boolean
  isDraft: boolean
  role?: Role | null
}

// The hourly cron flips the status on the hour, and may take a moment to run
const REFRESH_AFTER_ZERO_MS = [5_000, 30_000, 90_000, 180_000]

export function AuctionCountdown({ auction, isActive, isEnded, isAuthed, isDraft, role }: Props) {
  const router = useRouter()
  const { days, hours, minutes, seconds, done } = useCountdown(new Date(isDraft ? auction.startDate : auction.endDate))

  // At zero the page is still showing the old status. Once a refresh brings the new one, done goes
  // false again (the countdown moves to the next date) and the remaining refreshes are cancelled
  useEffect(() => {
    if (!done || isEnded) return
    const timers = REFRESH_AFTER_ZERO_MS.map((ms) => setTimeout(() => router.refresh(), ms))
    return () => timers.forEach(clearTimeout)
  }, [done, isEnded, router])

  return (
    <>
      <AuctionStickyHeader
        auction={auction}
        days={days}
        done={done}
        hours={hours}
        isActive={isActive}
        isEnded={isEnded}
        minutes={minutes}
        seconds={seconds}
        isAuthed={isAuthed}
        isDraft={isDraft}
      />

      <AuctionHeaderBand
        auction={auction}
        days={days}
        done={done}
        hours={hours}
        isActive={isActive}
        isEnded={isEnded}
        minutes={minutes}
        seconds={seconds}
        isDraft={isDraft}
        role={role}
      />
    </>
  )
}
