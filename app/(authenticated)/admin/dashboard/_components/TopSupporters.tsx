'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronUp } from 'lucide-react'
import { formatMoney } from 'lib/utils/currency.utils'
import Picture from 'components/_common/Picture'

type Supporter = {
  userId: string | null
  name: string
  location: string | null
  image: string | null
  totalGiven: number
  orderCount: number
}

export function TopSupporters({ supporters }: { supporters: Supporter[] }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [desktopOpen, setDesktopOpen] = useState(true)

  if (supporters.length === 0) return null

  const chevron = (open: boolean) => (
    <ChevronUp
      className={`w-4 h-4 text-muted-light dark:text-muted-dark shrink-0 transition-transform ${
        open ? 'rotate-180' : ''
      }`}
      aria-hidden="true"
    />
  )

  const heading = (
    <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark truncate">
      Top Supporters
    </p>
  )

  const list = (
    <ul className="divide-y divide-border-light dark:divide-border-dark overflow-y-auto max-h-[40vh] sm:max-h-[45vh]">
      {supporters.map((s, i) => (
        <li key={s.userId ?? i}>
          <Link
            href={s.userId ? `/admin/users/${s.userId}` : '#'}
            className="flex items-center gap-3 px-4 py-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            <div className="w-8 h-8 shrink-0 bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-light/30 dark:border-primary-dark/30 flex items-center justify-center overflow-hidden">
              {s.image ? (
                <Picture
                  priority={false}
                  src={s.image}
                  alt=""
                  className="w-full h-full object-cover"
                  unoptimized={false}
                />
              ) : (
                <span className="font-quicksand font-black text-[10px] text-primary-light dark:text-primary-dark">
                  {s.name[0]?.toUpperCase() ?? '?'}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-text-light dark:text-text-dark truncate group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors">
                {s.name}
              </p>
              {s.location && (
                <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark truncate">
                  {s.location}
                </p>
              )}
            </div>

            <div className="text-right shrink-0">
              <p className="font-quicksand font-black text-xs text-text-light dark:text-text-dark tabular-nums">
                {formatMoney(s.totalGiven)}
              </p>
              <p className="text-[9px] font-mono text-muted-light dark:text-muted-dark">
                {s.orderCount} order{s.orderCount === 1 ? '' : 's'}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )

  return (
    <>
      {/* Mobile — sheet above the shipments sheet */}
      <div className="sm:hidden absolute bottom-28 inset-x-0 border-t border-border-light dark:border-border-dark bg-bg-light/95 dark:bg-bg-dark/95 backdrop-blur">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          {heading}
          {chevron(mobileOpen)}
        </button>

        {mobileOpen && (
          <div className="border-t border-border-light dark:border-border-dark">{list}</div>
        )}
      </div>

      {/* Desktop — bottom left, collapsible */}
      <div className="hidden sm:block absolute bottom-4 left-4 w-72 border border-border-light dark:border-border-dark bg-bg-light/95 dark:bg-bg-dark/95 backdrop-blur">
        <div
          className={`px-4 py-3 flex items-center justify-between gap-2 ${
            desktopOpen ? 'border-b border-border-light dark:border-border-dark' : ''
          }`}
        >
          {heading}
          <button
            type="button"
            onClick={() => setDesktopOpen((v) => !v)}
            aria-expanded={desktopOpen}
            aria-label={desktopOpen ? 'Collapse top supporters' : 'Expand top supporters'}
            className="shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            {chevron(desktopOpen)}
          </button>
        </div>

        {desktopOpen && list}
      </div>
    </>
  )
}
