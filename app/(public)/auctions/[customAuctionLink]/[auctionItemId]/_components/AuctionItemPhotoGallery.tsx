import Picture from 'app/components/_common/Picture'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { IAuctionItemPhoto } from 'types/_auction-item-photo'

export function AuctionItemPhotoGallery({ photos, name }: { photos: IAuctionItemPhoto[]; name: string }) {
  const sorted = [...(photos ?? [])].sort(
    (a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0) || a.sortOrder - b.sortOrder
  )
  const [idx, setIdx] = useState(0)
  const current = sorted[idx]

  const prev = () => setIdx((i) => (i - 1 + sorted.length) % sorted.length)
  const next = () => setIdx((i) => (i + 1) % sorted.length)

  if (sorted.length === 0) {
    return (
      <div className="aspect-square bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark flex items-center justify-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '18px 18px'
          }}
          aria-hidden="true"
        />
        <div className="relative flex flex-col items-center gap-3">
          <div className="w-14 h-14 border border-border-light dark:border-border-dark flex items-center justify-center">
            <span className="font-quicksand font-black text-lg text-primary-light/20 dark:text-primary-dark/20 select-none">
              LP
            </span>
          </div>
          <span className="text-[8px] font-mono tracking-[0.4em] uppercase text-muted-light/30 dark:text-muted-dark/30">
            {name}
          </span>
        </div>
        <div
          className="absolute top-3 left-3 w-5 h-5 border-t border-l border-primary-light/20 dark:border-primary-dark/20"
          aria-hidden="true"
        />
        <div
          className="absolute top-3 right-3 w-5 h-5 border-t border-r border-primary-light/20 dark:border-primary-dark/20"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-3 left-3 w-5 h-5 border-b border-l border-primary-light/20 dark:border-primary-dark/20"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-primary-light/20 dark:border-primary-dark/20"
          aria-hidden="true"
        />
      </div>
    )
  }

  return (
    <div className="space-y-2" role="region" aria-label={`Photos of ${name}`}>
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark group">
        <Picture
          priority={true}
          key={current.url}
          src={current.url}
          alt={`${name} — photo ${idx + 1} of ${sorted.length}`}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {sorted.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-bg-light/85 dark:bg-bg-dark/85 backdrop-blur-sm border border-border-light dark:border-border-dark flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              <ChevronLeft size={15} aria-hidden="true" />
            </button>
            <button
              onClick={next}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-bg-light/85 dark:bg-bg-dark/85 backdrop-blur-sm border border-border-light dark:border-border-dark flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              <ChevronRight size={15} aria-hidden="true" />
            </button>
            <div className="absolute bottom-2 right-2 bg-bg-light/85 dark:bg-bg-dark/85 backdrop-blur-sm px-2.5 py-1 border border-border-light dark:border-border-dark">
              <span className="text-[9px] font-mono text-text-light dark:text-text-dark tabular-nums">
                {idx + 1} / {sorted.length}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-0.5" role="tablist" aria-label="Photo thumbnails">
          {sorted.map((photo, i) => (
            <button
              key={photo.id}
              role="tab"
              aria-selected={i === idx}
              aria-label={`View photo ${i + 1}`}
              onClick={() => setIdx(i)}
              className={`shrink-0 w-14 h-14 overflow-hidden border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark ${
                i === idx
                  ? 'border-primary-light dark:border-primary-dark'
                  : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <Picture
                priority={true}
                src={photo.url}
                alt=""
                className="w-full h-full object-cover"
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
