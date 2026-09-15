import { useCountdown } from '@hooks/useCountdown.hook'
import { CountUnit } from 'components/_primitives'
import { Clock } from 'lucide-react'

export function AuctionItemCountdown({ endDate }) {
  const { days, hours, minutes, seconds, done } = useCountdown(new Date(endDate))

  if (done) return

  return (
    <div className="border border-border-light dark:border-border-dark p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={11} className="text-muted-light dark:text-muted-dark" aria-hidden="true" />
        <span className="text-[9px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">Auction Closes In</span>
      </div>
      <div
        className="flex items-end gap-5"
        aria-label={`${days} days ${hours} hours ${minutes} minutes ${seconds} seconds remaining`}
        aria-live="polite"
        aria-atomic="true"
      >
        {days > 0 && <CountUnit value={days} label="days" size="lg" />}
        <CountUnit value={hours} label="hrs" size="lg" />
        <CountUnit value={minutes} label="min" size="lg" />
        <CountUnit value={seconds} label="sec" size="lg" />
      </div>
    </div>
  )
}
