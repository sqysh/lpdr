'use client'

import { useState } from 'react'
import Picture from 'components/_common/Picture'

function PhotoFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }}
        aria-hidden="true"
      />
      <span className="font-quicksand font-black text-2xl text-primary-light/20 dark:text-primary-dark/20 select-none" aria-hidden="true">
        LP
      </span>
    </div>
  )
}

export function AuctionItemCardPhoto({ isEnded, isSold, item, index }) {
  const photo = item.photos.find((p) => p.isPrimary) ?? item.photos[0]

  // Storing the failed url rather than a boolean means a new photo gets a fresh attempt without an effect to reset it
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const showPhoto = photo && failedSrc !== photo.url

  return (
    <div className="relative aspect-square overflow-hidden bg-surface-light dark:bg-surface-dark">
      {showPhoto ? (
        <Picture
          // Only the first row is visible on arrival; the rest load as people scroll, rather than all 33 competing at once
          priority={index < 4 && !isSold}
          src={photo.url}
          alt=""
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 430px) 50vw, 100vw"
          onError={() => setFailedSrc(photo.url)}
          className={`w-full h-full object-cover motion-safe:group-hover:scale-105 transition-transform duration-500 ease-out ${isSold || isEnded ? 'grayscale' : ''}`}
        />
      ) : (
        <PhotoFallback />
      )}
    </div>
  )
}
