import { useModalsStore } from 'stores/modals.store'
import { QUALITY_LABELS } from 'lib/constants/rescue-groups.constants'
import { SectionHeading } from './SectionHeading'
import { StatPill } from 'components/_primitives/StatPill'
import { DachshundDescription } from './DachshundDescription'

export function RightInfoPanel({ a }) {
  const openContact = useModalsStore((s) => s.openContact)

  return (
    <div className="flex flex-col gap-8">
      {/* Name + basics */}
      <div>
        <p className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark mb-1">
          Available for Adoption · {a?.rescueId}
        </p>
        <h1 className="font-quicksand text-4xl sm:text-5xl font-bold text-text-light dark:text-text-dark leading-tight">
          {a?.name}
        </h1>
        <p className="mt-2 text-muted-light dark:text-muted-dark text-base">
          {a?.ageString} · {a?.sex} · {a?.breedString} · {a?.colorDetails}
        </p>

        {/* Qualities */}
        <div className="flex flex-wrap gap-2 mt-4" role="list" aria-label="Traits and qualities">
          {a?.qualities?.map((q) => (
            <span
              key={q}
              role="listitem"
              className="text-xs font-medium px-3 py-1.5  bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark"
            >
              {QUALITY_LABELS[q] ?? q}
            </span>
          ))}
        </div>
      </div>

      {/* ── Stats grid (mobile — shown above description) ── */}
      <div className="lg:hidden">
        <SectionHeading>At a Glance</SectionHeading>
        <div className="grid grid-cols-2 xs:grid-cols-3 gap-2">
          <StatPill label="Age" value={a?.ageString} />
          <StatPill label="Sex" value={a?.sex} />
          <StatPill label="Weight" value={`${a?.sizeCurrent} ${a?.sizeUOM}`} />
          <StatPill label="Breed" value={a?.breedString} />
          <StatPill label="Color" value={a?.colorDetails} />
          <StatPill label="Energy" value={a?.energyLevel} />
          <StatPill label="Vocal" value={a?.vocalLevel} />
          <StatPill label="Grooming" value={a?.groomingNeeds} />
          <StatPill label="Experience" value={a?.ownerExperience} />
        </div>
      </div>

      {/* ── Compatibility ── */}
      <div>
        <SectionHeading>Compatibility</SectionHeading>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Good with Dogs', ok: a?.isDogsOk },
            { label: 'Good with Cats', ok: a?.isCatsOk },
            {
              label: 'Kids OK',
              ok: !a?.qualities?.includes('olderKidsOnly'),
              note: a?.qualities?.includes('olderKidsOnly') ? 'Older kids only' : undefined
            },
            {
              label: 'Yard Required',
              ok: !a?.isYardRequired,
              note: a?.isYardRequired ? 'Preferred' : 'Not required'
            },
            {
              label: 'Special Needs',
              ok: !a?.isSpecialNeeds,
              note: a?.isSpecialNeeds ? 'Yes' : 'No'
            },
            { label: 'Adults OK', ok: true, note: a?.adultSexesOk }
          ].map(({ label, ok, note }) => (
            <div
              key={label}
              className="flex items-center gap-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark  px-3 py-2.5"
            >
              <span
                aria-hidden="true"
                className={`w-2 h-2  shrink-0 ${ok ? 'bg-primary-light dark:bg-primary-dark' : 'bg-secondary-light dark:bg-secondary-dark'}`}
              />
              <div className="min-w-0">
                <p className="text-xs font-medium text-text-light dark:text-text-dark">{label}</p>
                {note && (
                  <p className="text-[10px] text-muted-light dark:text-muted-dark">{note}</p>
                )}
              </div>
              <span className="sr-only">{ok ? 'Yes' : 'No'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Adoption CTA ── */}
      <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark  p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-xs font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark">
              Adoption Fee
            </p>
            <p className="text-3xl font-bold font-quicksand text-text-light dark:text-text-dark mt-0.5">
              {a?.adoptionFeeString}
            </p>
          </div>
          {a?.isCourtesyListing && (
            <span className="text-xs font-medium px-3 py-1.5  bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              Courtesy Listing
            </span>
          )}
        </div>
        <a
          href="/adopt"
          className="block w-full text-center bg-button-light dark:bg-button-dark hover:bg-primary-light dark:hover:bg-primary-dark text-white font-semibold text-sm py-3.5 px-6 transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          aria-label={`Apply to adopt ${a?.name} (opens adoption application)`}
        >
          Apply to Adopt {a?.name}
        </a>
        <button
          onClick={openContact}
          className="block w-full text-center border border-border-light dark:border-border-dark hover:border-primary-light dark:hover:border-primary-dark text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark font-medium text-sm py-3 px-6 transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          Ask a Question
        </button>
      </div>

      {/* ── Description ── */}
      <DachshundDescription a={a} />
    </div>
  )
}
