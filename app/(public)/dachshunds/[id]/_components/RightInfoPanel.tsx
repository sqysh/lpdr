import { useModalsStore } from 'stores/modals.store'
import { SectionHeading } from './SectionHeading'
import { StatGrid } from './StatGrid'
import { DachshundDescription } from './DachshundDescription'
import { getCompatibility, getFosterNote, QUALITY_LABELS, TONE_DOT } from 'lib/utils/animal.utils'
import Link from 'next/link'

export function RightInfoPanel({ a }) {
  const openContact = useModalsStore((s) => s.openContact)
  const name = a?.name
  const foster = getFosterNote(a?.name)
  const basics = [a?.ageString, a?.sex, a?.breedString].filter(Boolean).join(' · ')

  return (
    <div className="flex flex-col gap-8">
      {/* Name + basics */}
      <div>
        <p className="text-xs font-mono tracking-eyebrow uppercase text-primary-light dark:text-primary-dark mb-1">
          {a?.isAdoptionPending ? 'Adoption Pending' : 'Available for Adoption'} · {a?.rescueId}
        </p>
        <h1 className="font-quicksand text-4xl sm:text-5xl font-bold text-text-light dark:text-text-dark leading-tight">{name}</h1>
        <p className="mt-2 text-muted-light dark:text-muted-dark text-base">{basics}</p>
        {foster && <p className="mt-1 text-sm text-muted-light dark:text-muted-dark capitalize">{foster}</p>}

        {/* Qualities */}
        {a?.qualities?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4" role="list" aria-label="Traits and qualities">
            {a.qualities.map((q) => (
              <span
                key={q}
                role="listitem"
                className="text-xs font-medium px-3 py-1.5 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark capitalize"
              >
                {QUALITY_LABELS[q] ?? q}
              </span>
            ))}
          </div>
        )}
      </div>

      <StatGrid a={a} className="lg:hidden" />

      {/* Compatibility */}
      <div>
        <SectionHeading>Living With {name}</SectionHeading>
        <div className="grid grid-cols-2 gap-2">
          {getCompatibility(a).map(({ key, label, tone }) => (
            <div
              key={key}
              className="flex items-center gap-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark px-3 py-2.5"
            >
              <span aria-hidden="true" className={`w-2 h-2 shrink-0 ${TONE_DOT[tone]}`} />
              <p className="text-xs font-medium text-text-light dark:text-text-dark min-w-0">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Adoption CTA */}
      <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-xs font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark">Adoption Fee</p>
            <p className="text-3xl font-bold font-quicksand text-text-light dark:text-text-dark mt-0.5">{a?.adoptionFeeString}</p>
          </div>
          {a?.isCourtesyListing && (
            <span className="text-xs font-medium px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              Courtesy Listing
            </span>
          )}
        </div>

        <Link
          href="/adopt"
          className="block w-full text-center bg-button-light dark:bg-button-dark hover:bg-primary-light dark:hover:bg-primary-dark text-white font-semibold text-sm py-3.5 px-6 transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          aria-label={`Apply to adopt ${name} (opens adoption application)`}
        >
          Apply to Adopt {name}
        </Link>
        <button
          onClick={openContact}
          className="block w-full text-center border border-border-light dark:border-border-dark hover:border-primary-light dark:hover:border-primary-dark text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark font-medium text-sm py-3 px-6 transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          Ask a Question
        </button>
      </div>

      <DachshundDescription a={a} />
    </div>
  )
}
