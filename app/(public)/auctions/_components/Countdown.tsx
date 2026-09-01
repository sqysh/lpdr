import { useCountdown } from 'lib/hooks/useCountdown.hook'
import { CountUnit } from 'components/_primitives'

export function Countdown({ endDate }: { endDate: Date }) {
  const { days, hours, minutes, seconds, done } = useCountdown(endDate)
  if (done)
    return (
      <span className="text-[10px] font-mono text-red-500 tracking-widest uppercase">Ended</span>
    )
  return (
    <div
      className="flex items-end gap-2.5"
      aria-label={`${days} days ${hours} hours ${minutes} minutes ${seconds} seconds remaining`}
    >
      {days > 0 && <CountUnit value={days} label="d" size="sm" />}
      <CountUnit value={hours} label="h" size="sm" />
      <CountUnit value={minutes} label="m" size="sm" />
      <CountUnit value={seconds} label="s" size="sm" />
    </div>
  )
}
