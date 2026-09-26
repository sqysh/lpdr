'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import Picture from 'components/_common/Picture'
import { IAuctionItemPhoto } from 'types/auction-item-photo'

const SWIPE_PX = 40

const ARROW =
  'absolute top-1/2 -translate-y-1/2 w-10 h-10 bg-bg-light/85 dark:bg-bg-dark/85 backdrop-blur-sm border border-border-light dark:border-border-dark flex items-center justify-center transition-opacity focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark'

// Hidden until hover only where hovering exists; on a touch screen the arrows are always shown
const HOVER_REVEAL = '[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100'

/** Horizontal swipes call onPrev or onNext. swiped reports whether the last touch was a swipe, so the tap that ends it can be ignored */
function useSwipe(onPrev: () => void, onNext: () => void) {
  const startX = useRef<number | null>(null)
  const swiped = useRef(false)

  return {
    swiped,
    handlers: {
      onTouchStart: (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX
        swiped.current = false
      },
      onTouchEnd: (e: React.TouchEvent) => {
        if (startX.current == null) return
        const dx = e.changedTouches[0].clientX - startX.current
        startX.current = null
        if (Math.abs(dx) < SWIPE_PX) return
        swiped.current = true
        if (dx > 0) onPrev()
        else onNext()
      }
    }
  }
}

function Lightbox({
  photos,
  idx,
  name,
  onPrev,
  onNext,
  onClose
}: {
  photos: IAuctionItemPhoto[]
  idx: number
  name: string
  onPrev: () => void
  onNext: () => void
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { handlers } = useSwipe(onPrev, onNext)
  const current = photos[idx]
  const many = photos.length > 1

  // showModal gives focus trapping, Escape and focus return for free; the page behind stops scrolling while it's open
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    dialog.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
      if (dialog.open) dialog.close()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-label={`Photos of ${name}`}
      onClose={onClose}
      onClick={(e) => {
        // Tapping the dark area around the photo closes it
        if (e.target === e.currentTarget) onClose()
      }}
      onKeyDown={(e) => {
        if (!many) return
        if (e.key === 'ArrowLeft') onPrev()
        if (e.key === 'ArrowRight') onNext()
      }}
      className="fixed inset-0 m-0 p-0 w-full h-full max-w-none max-h-none bg-black/95 text-white backdrop:bg-black/80 flex items-center justify-center"
    >
      <div className="absolute inset-0 px-2 sm:px-16 py-16" {...handlers}>
        {/* Fills the area and keeps its shape, rather than sizing to whatever width the image reports */}
        <Picture
          key={current.url}
          src={current.url}
          alt={`${name}, photo ${idx + 1} of ${photos.length}`}
          className="w-full h-full object-contain select-none"
        />
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close photos"
        className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center bg-white/10 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <X size={20} aria-hidden="true" />
      </button>

      {many && (
        <>
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous photo"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center bg-white/10 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next photo"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center bg-white/10 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
          <p
            className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/10 text-[11px] font-mono tabular-nums"
            aria-hidden="true"
          >
            {idx + 1} / {photos.length}
          </p>
        </>
      )}
    </dialog>
  )
}

export function AuctionItemPhotoGallery({ photos, name }: { photos: IAuctionItemPhoto[]; name: string }) {
  const sorted = [...(photos ?? [])].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0) || a.sortOrder - b.sortOrder)
  const [idx, setIdx] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const prev = () => setIdx((i) => (i - 1 + sorted.length) % sorted.length)
  const next = () => setIdx((i) => (i + 1) % sorted.length)
  const { swiped, handlers } = useSwipe(prev, next)

  if (sorted.length === 0) {
    return (
      <div className="aspect-square bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark flex items-center justify-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '18px 18px' }}
          aria-hidden="true"
        />
        <div className="relative flex flex-col items-center gap-3">
          <div className="w-14 h-14 border border-border-light dark:border-border-dark flex items-center justify-center" aria-hidden="true">
            <span className="font-quicksand font-black text-lg text-primary-light/20 dark:text-primary-dark/20 select-none">LP</span>
          </div>
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-muted-light dark:text-muted-dark">No photos yet</span>
        </div>
      </div>
    )
  }

  const current = sorted[idx]
  const many = sorted.length > 1

  return (
    <div className="space-y-2" role="region" aria-label={`Photos of ${name}`}>
      <div className="relative aspect-square overflow-hidden bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark group">
        {/* The photo itself opens the lightbox; a swipe changes photo instead, so it isn't also taken as a tap */}
        <button
          type="button"
          onClick={() => {
            if (swiped.current) return
            setLightboxOpen(true)
          }}
          aria-label={`View photo ${idx + 1} of ${sorted.length} full size`}
          className="absolute inset-0 w-full h-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          {...handlers}
        >
          <Picture priority key={current.url} src={current.url} alt="" className="w-full h-full object-cover" />
        </button>

        <span
          className="pointer-events-none absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-bg-light/85 dark:bg-bg-dark/85 backdrop-blur-sm border border-border-light dark:border-border-dark"
          aria-hidden="true"
        >
          <Expand size={13} />
        </span>

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
              <Picture src={photo.url} alt="" className="w-full h-full object-cover" />
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
