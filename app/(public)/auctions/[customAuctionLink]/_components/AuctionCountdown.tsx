'use client'

import { useCountdown } from 'lib/hooks/useCountdown.hook'
import { IAuction } from 'types/auction.types'
import { StickyHeader, HeaderBand } from './index'

export function AuctionCountdown({
  auction,
  isActive,
  isEnded,
  trigger,
  isAuthed,
  isDraft
}: {
  auction: IAuction
  isActive: boolean
  isEnded: boolean
  trigger: number
  isAuthed: boolean
  isDraft: boolean
}) {
  const { days, hours, minutes, seconds, done } = useCountdown(new Date(isDraft ? auction.startDate : auction.endDate))

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
        isDraft={isDraft}
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
        isDraft={isDraft}
      />
    </>
  )
}
