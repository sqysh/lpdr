'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react'
import Picture from 'components/_common/Picture'
import { IAuctionItemPhoto } from 'types/auction-item-photo'
import { useSwipe } from '@hooks/useSwipe.hook'
import { Lightbox } from 'components/_common/Lightbox'
import { PhotoFallback } from 'components/_common/PhotoFallback'

const ARROW =
  'absolute top-1/2 -translate-y-1/2 w-10 h-10 bg-bg-light/85 dark:bg-bg-dark/85 backdrop-blur-sm border border-border-light dark:border-border-dark flex items-center justify-center transition-opacity focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark'

// Hidden until hover only where hovering exists; on a touch screen the arrows are always shown
const HOVER_REVEAL = '[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100'

export function AuctionItemPhotoGallery({ photos, name }: { photos: IAuctionItemPhoto[]; name: string }) {
  const sorted = [...(photos ?? [])].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0) || a.sortOrder - b.sortOrder)
  const [idx, setIdx] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  const prev = () => setIdx((i) => (i - 1 + sorted.length) % sorted.length)
  const next = () => setIdx((i) => (i + 1) % sorted.length)
  const { swiped, handlers } = useSwipe(prev, next)

  if (sorted.length === 0) {
    return (
      <div className="aspect-square border border-border-light dark:border-border-dark overflow-hidden">
        <PhotoFallback label="No photos yet" />
      </div>
    )
  }

  const current = sorted[idx]
  const many = sorted.length > 1

  // Storing the failed url rather than a boolean means a new photo gets a fresh attempt without an effect to reset it
  const showPhoto = current.url && failedSrc !== current.url

  return (
    <div className="space-y-2" role="region" aria-label={`Photos of ${name}`}>
      <div className="relative aspect-square overflow-hidden bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark group">
        {/* The photo itself opens the lightbox; a swipe changes photo instead, so it isn't also taken as a tap */}
        <button
          type="button"
          onClick={() => {
            if (swiped.current || !showPhoto) return
            setLightboxOpen(true)
          }}
          aria-label={
            showPhoto ? `View photo ${idx + 1} of ${sorted.length} full size` : `Photo ${idx + 1} of ${sorted.length} couldn't load`
          }
          className={`absolute inset-0 w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark ${showPhoto ? 'cursor-zoom-in' : 'cursor-default'}`}
          {...handlers}
        >
          {showPhoto ? (
            <Picture
              priority
              unoptimized={false}
              sizes="(min-width: 1024px) 50vw, 100vw"
              key={current.url}
              src={current.url}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setFailedSrc(current.url)}
            />
          ) : (
            <PhotoFallback />
          )}
        </button>

        {showPhoto && (
          <span
            className="pointer-events-none absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-bg-light/85 dark:bg-bg-dark/85 backdrop-blur-sm border border-border-light dark:border-border-dark"
            aria-hidden="true"
          >
            <Expand size={13} />
          </span>
        )}

        {many && (
          <>
            <button type="button" onClick={prev} aria-label="Previous photo" className={`${ARROW} left-2 ${HOVER_REVEAL}`}>
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <button type="button" onClick={next} aria-label="Next photo" className={`${ARROW} right-2 ${HOVER_REVEAL}`}>
              <ChevronRight size={16} aria-hidden="true" />
            </button>
            <div
              className="pointer-events-none absolute bottom-2 right-2 bg-bg-light/85 dark:bg-bg-dark/85 backdrop-blur-sm px-2.5 py-1 border border-border-light dark:border-border-dark"
              aria-hidden="true"
            >
              <span className="text-[10px] font-mono text-text-light dark:text-text-dark tabular-nums">
                {idx + 1} / {sorted.length}
              </span>
            </div>
          </>
        )}
      </div>

      {many && (
        <div className="flex gap-1.5 overflow-x-auto pb-0.5" aria-label="Choose a photo">
          {sorted.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              aria-current={i === idx ? 'true' : undefined}
              aria-label={`Photo ${i + 1} of ${sorted.length}`}
              onClick={() => setIdx(i)}
              className={`shrink-0 w-14 h-14 overflow-hidden border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark ${
                i === idx ? 'border-primary-light dark:border-primary-dark' : 'border-transparent opacity-60 hover:opacity-90'
              }`}
            >
              <Picture
                unoptimized={false}
                sizes="56px"
                src={photo.url}
                alt=""
                className="w-full h-full object-cover"
                // A failed thumbnail is hidden rather than showing the browser's broken-image icon
                onError={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = 'hidden')}
              />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <Lightbox photos={sorted} idx={idx} name={name} onPrev={prev} onNext={next} onClose={() => setLightboxOpen(false)} />
      )}
    </div>
  )
}
