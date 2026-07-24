'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Picture from '../../../components/_common/Picture'
import { store } from 'app/lib/store/store'
import { setOpenContactModal } from 'app/lib/store/slices/uiSlice'
import { QUALITY_LABELS } from 'app/lib/constants/rescue-groups.constants'
import { Dog } from 'types/_rescue-groups.types'

// ─── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark  px-4 py-3 min-w-0">
      <span className="text-[10px] font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark">
        {label}
      </span>
      <span className="text-sm font-semibold text-text-light dark:text-text-dark truncate">
        {value}
      </span>
    </div>
  )
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span
        className="block w-6 h-px bg-primary-light dark:bg-primary-dark shrink-0"
        aria-hidden="true"
      />
      <h2 className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
        {children}
      </h2>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DachshundDetailClient({ data }: { data: Dog }) {
  const a = data?.attributes
  const [activePhoto, setActivePhoto] = useState(0)
  const [thumbStart, setThumbStart] = useState(0)
  const THUMB_PAGE = 5
  const searchParams = useSearchParams()
  const from = searchParams.get('from')

  const prevPhoto = () => setActivePhoto((p) => (p - 1 + a?.photos?.length) % a?.photos?.length)
  const nextPhoto = () => setActivePhoto((p) => (p + 1) % a?.photos?.length)

  const visibleThumbs = a?.photos.slice(thumbStart, thumbStart + THUMB_PAGE)
  const canScrollBack = thumbStart > 0
  const canScrollFwd = thumbStart + THUMB_PAGE < a?.photos?.length

  const cleanHtml = (a?.descriptionHtml ?? a?.descriptionText)
    ?.replace(/<img[^>]*tracker\.rescuegroups\.org[^>]*>/gi, '')
    ?.replace(/\sstyle="[^"]*"/gi, '')
    ?.replace(/\sstyle='[^']*'/gi, '')

  const KNOWN_SECTIONS = [
    'Overview',
    'Environment',
    'Pets & People',
    'Pets and People',
    'Location',
    'Health',
    'Personality'
  ]

  function splitIntoSections(text: string): { heading: string | null; body: string }[] {
    const decoded = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .replace(/&rsquo;/g, '’')
      .replace(/&ldquo;/g, '“')
      .replace(/&rdquo;/g, '”')
      .replace(/\n{2,}/g, '\n\n')
      .trim()

    // Build a regex that matches any known section label at the start of a "word boundary"
    const pattern = new RegExp(`(${KNOWN_SECTIONS.join('|')})\\s`, 'g')

    const matches = [...decoded.matchAll(pattern)]

    if (matches.length === 0) {
      // No known section labels found — treat as plain prose, single section
      return [{ heading: null, body: decoded }]
    }

    const sections: { heading: string | null; body: string }[] = []

    // Everything before the first match is intro/overview text with no heading
    const firstIndex = matches[0].index ?? 0
    if (firstIndex > 0) {
      const intro = decoded.slice(0, firstIndex).trim()
      if (intro) sections.push({ heading: null, body: intro })
    }

    for (let i = 0; i < matches.length; i++) {
      const heading = matches[i][1]
      const start = (matches[i].index ?? 0) + matches[i][0].length
      const end = i + 1 < matches.length ? matches[i + 1].index : decoded.length
      const body = decoded.slice(start, end).trim()
      sections.push({ heading, body })
    }

    return sections
  }

  const BREADCRUMB_LABELS: Record<string, string> = {
    '/dachshunds': 'Dachshunds',
    '/dachshunds/hold': 'On Hold Dachshunds'
  }

  type RequirementPill = { label: string; value: string }

  function extractRequirementPills(text: string): { pills: RequirementPill[]; remainder: string } {
    const lines = text.split('\n')

    const pillPattern = /^([A-Za-z][A-Za-z\s]{1,20}):\s*(.+)$/
    const pills: RequirementPill[] = []
    const remainderLines: string[] = []

    for (const line of lines) {
      const trimmed = line.trim()
      const match = trimmed.match(pillPattern)
      if (match) {
        pills.push({ label: match[1].trim(), value: match[2].trim() })
      } else {
        // Keep the line as-is (including blank lines) so paragraph breaks survive
        remainderLines.push(line)
      }
    }

    return { pills, remainder: remainderLines.join('\n') }
  }

  function processDescription(raw: string) {
    const decoded = raw
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .replace(/&rsquo;/g, '’')
      .replace(/&ldquo;/g, '“')
      .replace(/&rdquo;/g, '”')
      .replace(/\n{2,}/g, '\n\n')
      .trim()

    const { pills, remainder } = extractRequirementPills(decoded)
    const sections = splitIntoSections(remainder)

    return { pills, sections }
  }

  return (
    <main
      id="main-content"
      className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark"
    >
      {/* ── Breadcrumb ── */}
      <nav
        aria-label="Breadcrumb"
        className="1200:sticky 1200:top-0 px-4 sm:px-6 lg:px-8 pt-6 pb-2"
      >
        <ol className="max-w-180 1000:max-w-240 1200:max-w-300 mx-auto flex items-center gap-2 text-xs text-muted-light dark:text-muted-dark flex-wrap">
          <li>
            <Link
              href="/"
              className="hover:text-primary-light dark:hover:text-primary-dark transition-colors focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark outline-none"
            >
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href={from ?? '/dachshunds'}
              className="hover:text-primary-light dark:hover:text-primary-dark transition-colors focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark outline-none"
            >
              {BREADCRUMB_LABELS[from ?? ''] ?? 'Dachshunds'}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-text-light dark:text-text-dark font-medium" aria-current="page">
            {a?.name}
          </li>
        </ol>
      </nav>

      <div className="px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-180 1000:max-w-240 1200:max-w-300 mx-auto grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 lg:gap-14 items-start">
          {/* ══ LEFT — Gallery ══════════════════════════════════════════════ */}
          <div className="1200:sticky 1200:top-12">
            {/* Main image */}
            <div className="relative overflow-hidden  bg-surface-light dark:bg-surface-dark aspect-square sm:aspect-4/3">
              <Picture
                priority={true}
                src={a?.photos[activePhoto]}
                alt={`${a?.name}, photo ${activePhoto + 1} of ${a?.photos?.length}`}
                className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300"
              />

              {/* Prev/next */}
              <button
                onClick={prevPhoto}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9  bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={nextPhoto}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9  bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              {/* Counter */}
              <div
                className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-mono px-2.5 py-1 "
                aria-live="polite"
              >
                {activePhoto + 1} / {a?.photos?.length}
              </div>

              {/* Special needs badge */}
              {a?.isSpecialNeeds && (
                <div className="absolute top-3 left-3 bg-secondary-light dark:bg-secondary-dark text-white text-xs font-bold px-3 py-1  tracking-wide">
                  Special Needs
                </div>
              )}
              {a?.isAdoptionPending && (
                <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-3 py-1  tracking-wide">
                  Adoption Pending
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="mt-3 flex items-center gap-2">
              {canScrollBack && (
                <button
                  onClick={() => setThumbStart((s) => Math.max(0, s - THUMB_PAGE))}
                  aria-label="Show previous thumbnails"
                  className="shrink-0 w-8 h-8  border border-border-light dark:border-border-dark flex items-center justify-center text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="w-3.5 h-3.5"
                    aria-hidden="true"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
              )}
              <div
                className="flex gap-2 flex-1 overflow-hidden"
                role="list"
                aria-label="Photo thumbnails"
              >
                {visibleThumbs.map((photo, i) => {
                  const realIdx = thumbStart + i
                  return (
                    <button
                      key={realIdx}
                      onClick={() => setActivePhoto(realIdx)}
                      aria-label={`View photo ${realIdx + 1}`}
                      aria-pressed={activePhoto === realIdx}
                      className={`relative flex-1 aspect-square overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark transition-all ${
                        activePhoto === realIdx
                          ? 'ring-2 ring-primary-light dark:ring-primary-dark opacity-100'
                          : 'opacity-50 hover:opacity-80'
                      }`}
                    >
                      <Picture
                        priority={false}
                        src={photo}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover object-center"
                      />
                    </button>
                  )
                })}
              </div>
              {canScrollFwd && (
                <button
                  onClick={() => setThumbStart((s) => s + THUMB_PAGE)}
                  aria-label="Show more thumbnails"
                  className="shrink-0 w-8 h-8  border border-border-light dark:border-border-dark flex items-center justify-center text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="w-3.5 h-3.5"
                    aria-hidden="true"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              )}
            </div>

            {/* ── Stats grid (desktop below gallery) ── */}
            <div className="mt-8 hidden lg:block">
              <SectionHeading>At a Glance</SectionHeading>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <StatPill label="Age" value={a?.ageString} />
                <StatPill label="Sex" value={a?.sex} />
                <StatPill label="Weight" value={`${a?.sizeCurrent} ${a?.sizeUOM}`} />
                <StatPill label="Breed" value={a?.breedString} />
                <StatPill label="Color" value={a?.colorDetails} />
                <StatPill label="Coat" value={`${a?.coatLength} / ${a?.coatLength}`} />
                <StatPill label="Energy" value={a?.energyLevel} />
                <StatPill label="Activity" value={a?.activityLevel} />
                <StatPill label="Vocal" value={a?.vocalLevel} />
                <StatPill label="Grooming" value={a?.groomingNeeds} />
                <StatPill label="Shedding" value={a?.sheddingLevel} />
                <StatPill label="Experience" value={a?.ownerExperience} />
              </div>
            </div>
          </div>

          {/* ══ RIGHT — Info panel ══════════════════════════════════════════ */}
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
              <div
                className="flex flex-wrap gap-2 mt-4"
                role="list"
                aria-label="Traits and qualities"
              >
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
                      <p className="text-xs font-medium text-text-light dark:text-text-dark">
                        {label}
                      </p>
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
                href={a?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-button-light dark:bg-button-dark hover:bg-primary-light dark:hover:bg-primary-dark text-white font-semibold text-sm py-3.5 px-6 transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                aria-label={`Apply to adopt ${a?.name} (opens adoption application)`}
              >
                Apply to Adopt {a?.name}
              </a>
              <button
                onClick={() => store.dispatch(setOpenContactModal())}
                className="block w-full text-center border border-border-light dark:border-border-dark hover:border-primary-light dark:hover:border-primary-dark text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark font-medium text-sm py-3 px-6 transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                Ask a Question
              </button>
            </div>

            {/* ── Description ── */}
            <div>
              <SectionHeading>About {a?.name}</SectionHeading>

              {(() => {
                const { pills, sections } = processDescription(cleanHtml ?? '')

                return (
                  <>
                    {pills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {pills.map((pill, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-xs font-mono"
                          >
                            <span className="text-muted-light dark:text-muted-dark uppercase tracking-wide text-[10px]">
                              {pill.label}
                            </span>
                            <span className="text-text-light dark:text-text-dark font-semibold">
                              {pill.value}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}

                    {sections.map((section, i) => (
                      <div
                        key={i}
                        className={
                          section.heading
                            ? 'border-l-2 border-primary-light dark:border-primary-dark pl-4 mb-6'
                            : 'mb-6'
                        }
                      >
                        {section.heading && (
                          <h3 className="font-quicksand font-black text-lg text-primary-light dark:text-primary-dark mb-2">
                            {section.heading}
                          </h3>
                        )}
                        {section.body.split('\n\n').map((para, j) => (
                          <p
                            key={j}
                            className="text-sm text-text-light dark:text-text-dark leading-relaxed mb-3"
                          >
                            {para}
                          </p>
                        ))}
                      </div>
                    ))}
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
