import Picture from 'components/_common/Picture'
import { useState } from 'react'
import { StatGrid } from './StatGrid'

const THUMB_PAGE = 5

export function LeftGallery({ a }) {
  const [activePhoto, setActivePhoto] = useState(0)
  const [thumbStart, setThumbStart] = useState(0)
  const [failed, setFailed] = useState<Record<string, boolean>>({})

  // photos can be absent or empty on a new listing, and the modulo below turns that into NaN
  const photos: string[] = a?.photos ?? []
  const count = photos.length
  const hasMultiple = count > 1
  const name = a?.name

  const prevPhoto = () => setActivePhoto((p) => (p - 1 + count) % count)
  const nextPhoto = () => setActivePhoto((p) => (p + 1) % count)

  const visibleThumbs = photos.slice(thumbStart, thumbStart + THUMB_PAGE)
  const canScrollBack = thumbStart > 0
  const canScrollFwd = thumbStart + THUMB_PAGE < count

  const current = photos[activePhoto]
  const showMain = current && !failed[current]

  return (
    <div className="1200:sticky 1200:top-12">
      {/* Main image */}
      <div className="relative overflow-hidden bg-surface-light dark:bg-surface-dark aspect-square sm:aspect-4/3">
        {showMain ? (
          <Picture
            priority={true}
            src={current}
            alt={`${name}, photo ${activePhoto + 1} of ${count}`}
            onError={() => setFailed((f) => ({ ...f, [current]: true }))}
            className="absolute inset-0 w-full h-full object-contain object-center transition-opacity duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-quicksand font-black text-3xl text-primary-light/20 dark:text-primary-dark/20 select-none">LP</span>
          </div>
        )}

        {hasMultiple && (
          <>
            <button
              onClick={prevPhoto}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={nextPhoto}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4" aria-hidden="true">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-mono px-2.5 py-1" aria-live="polite">
              {activePhoto + 1} / {count}
            </div>
          </>
        )}

        {/* Adoption pending is the more urgent of the two, so it wins the corner */}
        {a?.isAdoptionPending ? (
          <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-3 py-1 tracking-wide">Adoption Pending</div>
        ) : (
          a?.isSpecialNeeds && (
            <div className="absolute top-3 left-3 bg-secondary-light dark:bg-secondary-dark text-white text-xs font-bold px-3 py-1 tracking-wide">
              Special Needs
            </div>
          )
        )}
      </div>

      {/* Thumbnails */}
      {hasMultiple && (
        <div className="mt-3 flex items-center gap-2">
          {canScrollBack && (
            <button
              onClick={() => setThumbStart((s) => Math.max(0, s - THUMB_PAGE))}
              aria-label="Show previous thumbnails"
              className="shrink-0 w-8 h-8 border border-border-light dark:border-border-dark flex items-center justify-center text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}
          <div className="flex gap-2 flex-1 overflow-hidden" role="list" aria-label="Photo thumbnails">
            {visibleThumbs.map((photo, i) => {
              const realIdx = thumbStart + i
              return (
                <button
                  key={photo}
                  onClick={() => setActivePhoto(realIdx)}
                  aria-label={`View photo ${realIdx + 1}`}
                  aria-pressed={activePhoto === realIdx}
                  className={`relative flex-1 aspect-square overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark transition-all ${
                    activePhoto === realIdx ? 'ring-2 ring-primary-light dark:ring-primary-dark opacity-100' : 'opacity-50 hover:opacity-80'
                  }`}
                >
                  {failed[photo] ? (
                    <span className="absolute inset-0 bg-surface-light dark:bg-surface-dark" aria-hidden="true" />
                  ) : (
                    <Picture
                      priority={false}
                      src={photo}
                      alt=""
                      aria-hidden="true"
                      onError={() => setFailed((f) => ({ ...f, [photo]: true }))}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                  )}
                </button>
              )
            })}
          </div>
          {canScrollFwd && (
            <button
              onClick={() => setThumbStart((s) => s + THUMB_PAGE)}
              aria-label="Show more thumbnails"
              className="shrink-0 w-8 h-8 border border-border-light dark:border-border-dark flex items-center justify-center text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5" aria-hidden="true">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}
        </div>
      )}

      <StatGrid a={a} className="mt-8 hidden lg:block" />
    </div>
  )
}
