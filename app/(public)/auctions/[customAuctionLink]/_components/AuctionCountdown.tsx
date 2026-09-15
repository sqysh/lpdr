'use client'

import { useCountdown } from 'lib/hooks/useCountdown.hook'
import { PublicAuction } from 'types/auction.types'
import { AuctionStickyHeader, AuctionHeaderBand } from './index'
import { Role } from '@prisma/client'

type Props = {
  auction: PublicAuction
  isActive: boolean
  isEnded: boolean
  trigger: number
  isAuthed: boolean
  isDraft: boolean
  role?: Role | null
}

export function AuctionCountdown({ auction, isActive, isEnded, trigger, isAuthed, isDraft, role }: Props) {
  const { days, hours, minutes, seconds, done } = useCountdown(new Date(isDraft ? auction.startDate : auction.endDate))

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
        role={role}
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
        trigger={trigger}
        isDraft={isDraft}
      />
    </>
  )
}
