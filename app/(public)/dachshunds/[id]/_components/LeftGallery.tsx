import Picture from 'components/_common/Picture'
import { useState } from 'react'
import { SectionHeading } from './SectionHeading'
import { StatPill } from 'components/_primitives/StatPill'

export function LeftGallery({ a }) {
  const [activePhoto, setActivePhoto] = useState(0)
  const [thumbStart, setThumbStart] = useState(0)
  const THUMB_PAGE = 5

  const prevPhoto = () => setActivePhoto((p) => (p - 1 + a?.photos?.length) % a?.photos?.length)
  const nextPhoto = () => setActivePhoto((p) => (p + 1) % a?.photos?.length)

  const visibleThumbs = a?.photos.slice(thumbStart, thumbStart + THUMB_PAGE)
  const canScrollBack = thumbStart > 0
  const canScrollFwd = thumbStart + THUMB_PAGE < a?.photos?.length

  return (
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
  )
}
