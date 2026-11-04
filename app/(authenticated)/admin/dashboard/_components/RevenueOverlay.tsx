'use client'

import { formatMoney } from 'lib/utils/currency.utils'
import { HISTORICAL_TOTAL, sourceMeta } from 'lib/constants/dashboard.constants'
import { ChevronDown, TrendingDown, TrendingUp } from 'lucide-react'
import { useState } from 'react'

const COLORS = [
  'bg-primary-light dark:bg-primary-dark',
  'bg-secondary-light dark:bg-secondary-dark',
  'bg-teal-500 dark:bg-teal-400',
  'bg-purple-500 dark:bg-purple-400',
  'bg-amber-500 dark:bg-amber-400'
]

const fmtType = (type: string) => sourceMeta[type]?.label ?? type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')

type RevenueProps = {
  liveRevenue: number
  monthlyChange: number
  sources: { type: string; total: number }[]
}

export function RevenueBreakdown({ liveRevenue, monthlyChange, sources }: RevenueProps) {
  const up = monthlyChange >= 0
  const sourceTotal = sources.reduce((sum, s) => sum + s.total, 0)

  const segments = sources
    .map((s, i) => ({
      ...s,
      pct: sourceTotal > 0 ? (s.total / sourceTotal) * 100 : 0,
      color: COLORS[i % COLORS.length]
    }))
    .sort((a, b) => b.total - a.total)

  return (
    <>
      <div className="px-4 py-3">
        <p className="font-quicksand text-3xl font-black text-primary-light dark:text-primary-dark leading-none">
          {formatMoney(liveRevenue)}
        </p>

        <div className="flex items-center gap-1.5 mt-2.5">
          {up ? (
            <TrendingUp className="w-3.5 h-3.5 shrink-0 text-green-600 dark:text-green-400" aria-hidden="true" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
          )}
          <span
            className={`font-mono text-[10px] tracking-tag uppercase ${up ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
          >
            {up ? 'Up' : 'Down'} {Math.abs(monthlyChange).toFixed(1)}% vs last month
          </span>
        </div>
      </div>

      {segments.length > 0 && (
        <div className="px-4 pb-3">
          <div
            className="flex h-1.5 w-full overflow-hidden"
            role="img"
            aria-label={`Revenue by source: ${segments.map((s) => `${fmtType(s.type)} ${Math.round(s.pct)}%`).join(', ')}`}
          >
            {segments.map((s) => (
              <span key={s.type} className={s.color} style={{ width: `${s.pct}%` }} />
            ))}
          </div>

          <ul className="mt-2.5 space-y-1.5">
            {segments.map((s) => (
              <li key={s.type} className="flex items-center gap-2">
                <span className={`w-2 h-2 shrink-0 ${s.color}`} aria-hidden="true" />
                <span className="font-mono text-[10px] tracking-widest uppercase text-muted-light dark:text-muted-dark flex-1 min-w-0 truncate">
                  {fmtType(s.type)}
                </span>
                <span className="font-mono text-[10px] tabular-nums text-muted-light/70 dark:text-muted-dark/70 shrink-0">
                  {Math.round(s.pct)}%
                </span>
                <span className="font-quicksand font-black text-[11px] tabular-nums text-text-light dark:text-text-dark shrink-0">
                  {formatMoney(s.total)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="px-4 py-2.5 border-t border-border-light dark:border-border-dark flex items-center justify-between">
        <span className="font-mono text-[9px] tracking-tag uppercase text-muted-light dark:text-muted-dark">+ historical</span>
        <span className="font-mono text-xs font-bold text-muted-light dark:text-muted-dark tabular-nums">
          {formatMoney(HISTORICAL_TOTAL)}
        </span>
      </div>
    </>
  )
}

export function RevenueOverlay(props: RevenueProps) {
  const [open, setOpen] = useState(true)

  return (
    <div className="hidden sm:flex flex-col absolute top-4 left-4 w-72 max-h-[calc(50%-1.5rem)] border border-border-light dark:border-border-dark bg-bg-light/95 dark:bg-bg-dark/95 backdrop-blur">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="revenue-breakdown"
        className={`shrink-0 w-full flex items-center justify-between gap-3 px-4 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark ${open ? 'border-b border-border-light dark:border-border-dark' : ''}`}
      >
        <span className="font-mono text-[10px] tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">
          Total revenue · all time
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 text-muted-light dark:text-muted-dark transition-transform ${open ? '' : '-rotate-90'}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div id="revenue-breakdown" className="min-h-0 overflow-y-auto">
          <RevenueBreakdown {...props} />
        </div>
      )}
    </div>
  )
}
