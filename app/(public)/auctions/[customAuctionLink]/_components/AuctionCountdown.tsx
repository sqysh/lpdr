'use client'

import { useCountdown } from 'lib/hooks/useCountdown.hook'
import { IAuction } from 'types/_auction'
import { StickyHeader, HeaderBand } from './index'

export function AuctionCountdown({
  auction,
  isActive,
  isEnded,
  trigger,
  isAuthed
}: {
  auction: IAuction
  isActive: boolean
  isEnded: boolean
  trigger: number
  isAuthed: boolean
}) {
  const { days, hours, minutes, seconds, done } = useCountdown(new Date(auction.endDate))

  return (
    <>
      <StickyHeader
        auction={auction}
        days={days}
        done={done}
        hours={hours}
        isActive={isActive}
        isEnded={isEnded}
        minutes={minutes}
        seconds={seconds}
        isAuthed={isAuthed}
      />
      <HeaderBand
        auction={auction}
        days={days}
        done={done}
        hours={hours}
        isActive={isActive}
        isEnded={isEnded}
        minutes={minutes}
        seconds={seconds}
        trigger={trigger}
      />
    </>
  )
}
