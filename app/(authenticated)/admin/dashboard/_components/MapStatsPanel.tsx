'use client'

import { useState } from 'react'
import { ChevronUp, MapPin, Users } from 'lucide-react'
import { RegionCount } from '../_types/map.types'

type RegionProps = {
  regionCounts: { region: string; count: number }[]
  onRegionClick: (region: RegionCount) => void
}

export function RegionList({ regionCounts, onRegionClick }: RegionProps) {
  return (
    <ul className="divide-y divide-border-light dark:divide-border-dark">
      {regionCounts.map((r) => (
        <li key={r.region}>
          <button
            type="button"
            onClick={() => onRegionClick(r as RegionCount)}
            className="w-full flex items-center justify-between px-4 py-2 hover:bg-primary-light/10 dark:hover:bg-primary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            <span className="text-[11px] font-mono text-text-light dark:text-text-dark">{r.region}</span>
            <span className="text-[11px] font-mono tabular-nums text-muted-light dark:text-muted-dark">{r.count}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export function MapStatsPanel({ total, regionCounts, onRegionClick }: RegionProps & { total: number }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="hidden sm:flex flex-col absolute bottom-4 right-4 w-56 max-h-[calc(50vh-2rem)] border border-border-light dark:border-border-dark bg-bg-light/95 dark:bg-bg-dark/95 backdrop-blur">
      <div
        className={`shrink-0 px-4 py-3 flex items-center justify-between gap-2 ${open ? 'border-b border-border-light dark:border-border-dark' : ''}`}
      >
        <p className="text-[10px] font-mono tracking-eyebrow uppercase text-primary-light dark:text-primary-dark truncate">
          Supporter Reach
        </p>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Collapse supporter stats' : 'Expand supporter stats'}
          className="shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          <ChevronUp
            className={`w-4 h-4 text-muted-light dark:text-muted-dark shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {open && (
        <>
          <div className="shrink-0 px-4 py-3 space-y-3 border-b border-border-light dark:border-border-dark">
            <div className="flex items-center gap-2.5">
              <Users className="w-3.5 h-3.5 text-muted-light dark:text-muted-dark shrink-0" aria-hidden="true" />
              <span className="font-quicksand font-black text-lg text-text-light dark:text-text-dark tabular-nums">
                {total.toLocaleString()}
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark">located</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-3.5 h-3.5 text-muted-light dark:text-muted-dark shrink-0" aria-hidden="true" />
              <span className="font-quicksand font-black text-lg text-text-light dark:text-text-dark tabular-nums">
                {regionCounts.length}
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark">regions</span>
            </div>
          </div>
          <div className="min-h-0 overflow-y-auto">
            <RegionList regionCounts={regionCounts} onRegionClick={onRegionClick} />
          </div>
        </>
      )}
    </div>
  )
}
