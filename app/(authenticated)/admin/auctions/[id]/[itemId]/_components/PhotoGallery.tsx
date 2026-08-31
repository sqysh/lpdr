import Picture from 'app/components/_common/Picture'
import { Package, Star } from 'lucide-react'
import { useState } from 'react'
import { IAuctionItemPhoto } from 'types/_auction-item-photo'

export function PhotoGallery({ photos }: { photos: IAuctionItemPhoto[] }) {
  const sorted = [...photos].sort((a, b) => a.sortOrder - b.sortOrder)
  const primary = sorted.find((p) => p.isPrimary) ?? sorted[0]
  const [active, setActive] = useState(primary?.id ?? sorted[0]?.id)
  const activePhoto = sorted.find((p) => p.id === active) ?? sorted[0]

  if (sorted.length === 0) {
    return (
      <div className="aspect-square bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark flex items-center justify-center">
        <Package size={40} className="text-muted-light dark:text-muted-dark" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main photo */}
      <div className="relative aspect-square border border-border-light dark:border-border-dark overflow-hidden bg-surface-light dark:bg-surface-dark">
        <Picture
          key={activePhoto?.id}
          priority={true}
          src={activePhoto?.url}
          alt={activePhoto?.name ?? 'Item photo'}
          className="w-full h-full object-cover"
        />
        {activePhoto?.isPrimary && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-bg-light/90 dark:bg-bg-dark/90 backdrop-blur-sm px-2 py-1 border border-border-light dark:border-border-dark">
            <Star size={9} className="text-amber-500" aria-hidden="true" />
            <span className="text-[9px] font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark">
              Primary
            </span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="grid grid-cols-5 gap-1.5" role="list" aria-label="Photo thumbnails">
          {sorted.map((photo) => (
            <button
              key={photo.id}
              role="listitem"
              onClick={() => setActive(photo.id)}
              aria-label={`View photo ${photo.name ?? ''}`}
              className={`relative aspect-square overflow-hidden border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark ${
                active === photo.id
                  ? 'border-primary-light dark:border-primary-dark opacity-100'
                  : 'border-border-light dark:border-border-dark opacity-50 hover:opacity-80'
              }`}
            >
              <Picture priority={true} src={photo.url} alt={photo.name ?? ''} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
