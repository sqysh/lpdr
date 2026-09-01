import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

function getTimeLeft() {
  const race = new Date('2026-06-06T09:00:00-04:00')
  const now = new Date()
  const diff = race.getTime() - now.getTime()

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000)
  }
}

export function EventCountdown({ variant = 'stacked' }: { variant?: 'stacked' | 'horizontal' }) {
  const [time, setTime] = useState(getTimeLeft())

  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeLeft()), 1000)
    return () => clearInterval(interval)
  }, [])

  const units = [
    { value: time.days, label: 'Days' },
    { value: time.hours, label: 'Hours' },
    { value: time.minutes, label: 'Mins' },
    { value: time.seconds, label: 'Secs' }
  ]

  // ── Thin horizontal mobile bar ──
  if (variant === 'horizontal') {
    return (
      <div className="flex items-center gap-3 w-full px-3 min-[400px]:px-4 py-2">
        {/* Label + date, stacked tight on the left */}
        <div className="flex flex-col min-w-0 shrink">
          <p className="text-f9 min-[400px]:text-f10 font-mono tracking-[0.15em] uppercase text-primary-light dark:text-primary-dark leading-none truncate">
            Georgia Dachshund Races
          </p>
          <p className="hidden min-[380px]:block text-[9px] font-nunito text-muted-light dark:text-muted-dark leading-none mt-1 truncate">
            June 6, 2026 · Benefiting LPDR
          </p>
        </div>

        {/* Countdown digits, inline */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto" suppressHydrationWarning>
          {units.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center">
              <p className="font-sora font-black text-[15px] min-[400px]:text-[17px] text-primary-light dark:text-primary-dark tabular-nums leading-none">
                {String(value).padStart(2, '0')}
              </p>
              <p className="text-[7px] font-mono tracking-wider uppercase text-muted-light dark:text-muted-dark mt-0.5 leading-none">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Tickets button, compact */}

        <a
          href="https://www.ticketsignup.io/TicketEvent/GeorgiaDachshundRaces2026"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Get tickets for the Georgia Dachshund Races"
          className="hidden min-[440px]:inline-flex items-center justify-center gap-1 shrink-0 px-3 py-1.5 border border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark text-[9px] font-mono tracking-[0.15em] uppercase hover:bg-primary-light dark:hover:bg-primary-dark hover:text-white dark:hover:text-bg-dark transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          Tickets
          <ArrowRight className="w-2.5 h-2.5" aria-hidden="true" />
        </a>
      </div>
    )
  }

  // ── Stacked desktop version (unchanged) ──
  return (
    <div className="w-full text-center">
      <p className="text-f10 font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark mb-1">
        Georgia Dachshund Races
      </p>
      <p className="text-[10px] 1200:text-[11px] font-nunito text-muted-light dark:text-muted-dark mb-3 1200:mb-4 leading-snug">
        June 6, 2026 · Gwinnett County Fairgrounds · Benefiting LPDR
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

      <a
        href="https://www.ticketsignup.io/TicketEvent/GeorgiaDachshundRaces2026"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center w-full gap-2 px-4 py-2 border border-primary-light dark:border-primary-dark text-primary-light dark:text-primary-dark text-[10px] font-mono tracking-[0.2em] uppercase hover:bg-primary-light dark:hover:bg-primary-dark hover:text-white dark:hover:text-bg-dark transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2"
      >
        Get Tickets
        <ArrowRight className="w-3 h-3" aria-hidden="true" />
      </a>
    </div>
  )
}
