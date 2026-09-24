'use client'

import { useEffect, useState, useTransition } from 'react'
import { Check, ChevronDown, Loader2, Search, UserRound } from 'lucide-react'
import Picture from 'components/_common/Picture'
import { formatDate } from 'lib/utils/date.utils'
import { searchAdopters, type AdopterResult } from 'lib/actions/admin/adoption-agreement/searchAdopters'

export type DogOption = { id: string; name: string; photo: string | null; colorDetails: string | null }

const inputClass =
  'w-full pl-9 pr-3 py-2.5 text-sm border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark placeholder:text-muted-light/60 dark:placeholder:text-muted-dark/60 focus:outline-none focus-visible:border-primary-light dark:focus-visible:border-primary-dark'

export function AdopterSearch({ onSelect }: { onSelect: (adopter: AdopterResult) => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AdopterResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSearching, startSearch] = useTransition()

  useEffect(() => {
    // Waits for a pause in typing so every keystroke doesn't hit the database
    const timeout = setTimeout(() => {
      startSearch(async () => {
        const result = await searchAdopters(query)
        setResults(result.success ? (result.data ?? []) : [])
        setError(result.success ? null : result.error)
      })
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

  return (
    <div className="space-y-3">
      <label
        htmlFor="adopter-search"
        className="block text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark"
      >
        Find the adopter by name or email
      </label>
      <div className="relative">
        {isSearching ? (
          <Loader2
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-light dark:text-muted-dark"
            aria-hidden="true"
          />
        ) : (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-light dark:text-muted-dark" aria-hidden="true" />
        )}
        <input
          id="adopter-search"
          type="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Jane Smith or jane@…"
          className={inputClass}
        />
      </div>

      {error && <p className="text-xs font-mono text-red-600 dark:text-red-400">{error}</p>}

      {query.trim().length >= 2 && !isSearching && results.length === 0 && !error && (
        <p className="text-xs font-mono text-muted-light dark:text-muted-dark">
          No accounts match. The adopter needs to create an account before an agreement can be sent to them.
        </p>
      )}

      {results.length > 0 && (
        <ul className="border border-border-light dark:border-border-dark divide-y divide-border-light dark:divide-border-dark" role="list">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onSelect(r)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-bg-light dark:hover:bg-bg-dark transition-colors focus:outline-none focus-visible:bg-bg-light dark:focus-visible:bg-bg-dark"
              >
                <UserRound className="w-4 h-4 shrink-0 text-muted-light dark:text-muted-dark" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-nunito text-text-light dark:text-text-dark truncate">{r.name}</p>
                  <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark truncate">{r.email}</p>
                </div>
                {r.appliedAt ? (
                  <span className="shrink-0 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                    Applied {formatDate(r.appliedAt)}
                  </span>
                ) : (
                  <span className="shrink-0 text-[10px] font-mono text-amber-600 dark:text-amber-400">No application on file</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function DogGrid({
  dogs,
  unavailable,
  onSelect
}: {
  dogs: DogOption[]
  unavailable: Record<string, string>
  onSelect: (dog: DogOption) => void
}) {
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3" role="list">
      {dogs.map((dog) => {
        const reason = unavailable[dog.id]

        return (
          <li key={dog.id}>
            <button
              type="button"
              disabled={!!reason}
              onClick={() => onSelect(dog)}
              className="group w-full text-left border border-border-light dark:border-border-dark hover:border-primary-light dark:hover:border-primary-dark disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border-light transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              <div className="relative aspect-square overflow-hidden bg-bg-light dark:bg-bg-dark">
                {dog.photo && (
                  <Picture
                    src={dog.photo}
                    alt=""
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${reason ? 'grayscale' : ''}`}
                  />
                )}
              </div>
              <div className="px-2.5 py-2">
                <p className="text-xs font-nunito font-bold text-text-light dark:text-text-dark truncate">{dog.name}</p>
                {reason && <p className="text-[9px] font-mono text-muted-light dark:text-muted-dark">{reason}</p>}
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export function DogPicker({
  available,
  hold,
  unavailable,
  onSelect
}: {
  available: DogOption[]
  hold: DogOption[]
  unavailable: Record<string, string>
  onSelect: (dog: DogOption) => void
}) {
  const [filter, setFilter] = useState('')
  const [showHold, setShowHold] = useState(false)

  const matches = (d: DogOption) => d.name.toLowerCase().includes(filter.trim().toLowerCase())
  const visibleAvailable = filter ? available.filter(matches) : available
  const visibleHold = filter ? hold.filter(matches) : hold

  // Searching opens the hold list too, so a rehoming dog is found by name without knowing where it's listed
  const holdOpen = showHold || (!!filter && visibleHold.length > 0)

  return (
    <div className="space-y-5">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-light dark:text-muted-dark" aria-hidden="true" />
        <input
          type="search"
          autoFocus
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by name"
          aria-label="Filter dogs by name"
          className={inputClass}
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">
          Available ({visibleAvailable.length})
        </h3>
        {visibleAvailable.length > 0 ? (
          <DogGrid dogs={visibleAvailable} unavailable={unavailable} onSelect={onSelect} />
        ) : (
          <p className="text-xs font-mono text-muted-light dark:text-muted-dark">
            {filter ? 'No available dogs match.' : 'No dogs are listed as available.'}
          </p>
        )}
      </div>

      {hold.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border-light dark:border-border-dark">
          <button
            type="button"
            onClick={() => setShowHold((s) => !s)}
            aria-expanded={holdOpen}
            className="flex items-center gap-2 text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark focus:outline-none focus-visible:underline"
          >
            <ChevronDown className={`w-3 h-3 transition-transform ${holdOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            On hold ({visibleHold.length})
          </button>

          {holdOpen && (
            <>
              <p className="text-xs font-mono text-muted-light dark:text-muted-dark">
                Usually not ready for adoption yet. Only choose one of these for a direct rehoming.
              </p>
              {visibleHold.length > 0 ? (
                <DogGrid dogs={visibleHold} unavailable={unavailable} onSelect={onSelect} />
              ) : (
                <p className="text-xs font-mono text-muted-light dark:text-muted-dark">No dogs on hold match.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// Collapsed view of a step once it's done, with a way back
export function ChosenSummary({
  label,
  title,
  detail,
  photo,
  onChange
}: {
  label: string
  title: string
  detail?: string
  photo?: string | null
  onChange: () => void
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
      {photo !== undefined ? (
        <div className="w-10 h-10 shrink-0 overflow-hidden bg-bg-light dark:bg-bg-dark">
          {photo && <Picture src={photo} alt="" className="w-full h-full object-cover" />}
        </div>
      ) : (
        <Check className="w-4 h-4 shrink-0 text-primary-light dark:text-primary-dark" aria-hidden="true" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">{label}</p>
        <p className="text-sm font-nunito font-bold text-text-light dark:text-text-dark truncate">{title}</p>
        {detail && <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark truncate">{detail}</p>}
      </div>
      <button
        type="button"
        onClick={onChange}
        className="shrink-0 text-[10px] font-mono tracking-eyebrow uppercase text-primary-light dark:text-primary-dark hover:underline focus:outline-none focus-visible:underline"
      >
        Change
      </button>
    </div>
  )
}
