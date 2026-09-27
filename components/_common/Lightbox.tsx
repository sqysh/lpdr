'use client'

import { useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Picture from 'components/_common/Picture'
import { IAuctionItemPhoto } from 'types/auction-item-photo'
import { useSwipe } from '@hooks/useSwipe.hook'

export function Lightbox({
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
