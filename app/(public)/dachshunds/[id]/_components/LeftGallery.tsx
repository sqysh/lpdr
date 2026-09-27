'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react'
import Picture from 'components/_common/Picture'
import { Lightbox } from 'components/_common/Lightbox'
import { PhotoFallback } from 'components/_common/PhotoFallback'
import { useSwipe } from '@hooks/useSwipe.hook'
import { StatGrid } from './StatGrid'

const THUMB_PAGE = 5

const ARROW =
  'absolute top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark'

const THUMB_ARROW =
  'shrink-0 w-8 h-8 border border-border-light dark:border-border-dark flex items-center justify-center text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark'

export function LeftGallery({ a }) {
  const [activePhoto, setActivePhoto] = useState(0)
  const [thumbStart, setThumbStart] = useState(0)
  const [failed, setFailed] = useState<Record<string, boolean>>({})
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // photos can be absent or empty on a new listing, and the modulo below turns that into NaN
  const photos: string[] = a?.photos ?? []
  const count = photos.length
  const hasMultiple = count > 1
  const name = a?.name

  // Moving to a photo also brings its thumbnail into view, so the highlighted one is never off the strip
  const goTo = (i: number) => {
    setActivePhoto(i)
    setThumbStart(Math.floor(i / THUMB_PAGE) * THUMB_PAGE)
  }
  const prevPhoto = () => goTo((activePhoto - 1 + count) % count)
  const nextPhoto = () => goTo((activePhoto + 1) % count)
  const { swiped, handlers } = useSwipe(prevPhoto, nextPhoto)

  const visibleThumbs = photos.slice(thumbStart, thumbStart + THUMB_PAGE)
  const canScrollBack = thumbStart > 0
  const canScrollFwd = thumbStart + THUMB_PAGE < count

  const current = photos[activePhoto]
  const showMain = !!current && !failed[current]

  return (
    <div className="1200:sticky 1200:top-12">
      <div className="relative overflow-hidden bg-surface-light dark:bg-surface-dark aspect-square sm:aspect-4/3">
        {/* The photo opens full size; a swipe changes photo instead, so it isn't also taken as a tap */}
        <button
          type="button"
          onClick={() => {
            if (swiped.current || !showMain) return
            setLightboxOpen(true)
          }}
          aria-label={showMain ? `View photo ${activePhoto + 1} of ${count} of ${name} full size` : `Photo of ${name} unavailable`}
          className={`absolute inset-0 w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark ${showMain ? 'cursor-zoom-in' : 'cursor-default'}`}
          {...handlers}
        >
          {showMain ? (
            <Picture
              priority
              unoptimized={false}
              sizes="(min-width: 1200px) 50vw, 100vw"
              key={current}
              src={current}
              alt=""
              onError={() => setFailed((f) => ({ ...f, [current]: true }))}
              className="w-full h-full object-contain object-center"
            />
          ) : (
            <PhotoFallback label={count === 0 ? 'Photos coming soon' : undefined} />
          )}
        </button>

        {showMain && (
          <span
            className="pointer-events-none absolute bottom-3 left-3 w-8 h-8 flex items-center justify-center bg-black/40 text-white"
            aria-hidden="true"
          >
            <Expand size={13} />
          </span>
        )}

        {hasMultiple && (
          <>
            <button type="button" onClick={prevPhoto} aria-label="Previous photo" className={`${ARROW} left-3`}>
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <button type="button" onClick={nextPhoto} aria-label="Next photo" className={`${ARROW} right-3`}>
              <ChevronRight size={16} aria-hidden="true" />
            </button>
            <div
              className="pointer-events-none absolute bottom-3 right-3 bg-black/50 text-white text-xs font-mono px-2.5 py-1"
              aria-hidden="true"
            >
              {activePhoto + 1} / {count}
            </div>
          </>
        )}

        {/* Adoption pending is the more urgent of the two, so it wins the corner */}
        {a?.isAdoptionPending ? (
          <div className="pointer-events-none absolute top-3 left-3 bg-amber-600 text-white text-xs font-bold px-3 py-1 tracking-wide">
            Adoption Pending
          </div>
        ) : (
          a?.isSpecialNeeds && (
            <div className="pointer-events-none absolute top-3 left-3 bg-secondary-light dark:bg-secondary-dark text-white text-xs font-bold px-3 py-1 tracking-wide">
              Special Needs
            </div>
          )
        )}
      </div>

      {hasMultiple && (
        <div className="mt-3 flex items-center gap-2">
          {canScrollBack && (
            <button
              type="button"
              onClick={() => setThumbStart((s) => Math.max(0, s - THUMB_PAGE))}
              aria-label="Show previous photos"
              className={THUMB_ARROW}
            >
              <ChevronLeft size={14} aria-hidden="true" />
            </button>
          )}
          <div className="flex gap-2 flex-1 overflow-hidden" aria-label="Choose a photo">
            {visibleThumbs.map((photo, i) => {
              const realIdx = thumbStart + i
              return (
                <button
                  key={photo}
                  type="button"
                  onClick={() => goTo(realIdx)}
                  aria-label={`Photo ${realIdx + 1} of ${count}`}
                  aria-current={activePhoto === realIdx ? 'true' : undefined}
                  className={`relative flex-1 aspect-square overflow-hidden bg-surface-light dark:bg-surface-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark transition-all ${
                    activePhoto === realIdx ? 'ring-2 ring-primary-light dark:ring-primary-dark' : 'opacity-60 hover:opacity-90'
                  }`}
                >
                  {!failed[photo] && (
                    <Picture
                      unoptimized={false}
                      sizes="96px"
                      src={photo}
                      alt=""
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
              type="button"
              onClick={() => setThumbStart((s) => s + THUMB_PAGE)}
              aria-label="Show more photos"
              className={THUMB_ARROW}
            >
              <ChevronRight size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      <StatGrid a={a} className="mt-8 hidden lg:block" />

      {lightboxOpen && (
        <Lightbox
          photos={photos.map((url) => ({ url }))}
          idx={activePhoto}
          name={name}
          onPrev={prevPhoto}
          onNext={nextPhoto}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  )
}
