'use client'

import { memo } from 'react'
import { OVERLAY_MOUSE_TARGET, OverlayViewF } from '@react-google-maps/api'

const tierClass = {
  single: 'bg-primary-light/70 dark:bg-primary-dark/70 ring-1 ring-white/40 dark:ring-white/20',
  small:
    'bg-primary-light dark:bg-primary-dark ring-1 ring-white/50 dark:ring-white/25 shadow-lg shadow-primary-light/30 dark:shadow-primary-dark/30',
  medium:
    'bg-secondary-light dark:bg-secondary-dark ring-1 ring-white/60 dark:ring-white/30 shadow-lg shadow-secondary-light/40 dark:shadow-secondary-dark/40',
  large:
    'bg-amber-500 dark:bg-amber-400 ring-2 ring-white/70 dark:ring-white/40 shadow-xl shadow-amber-500/40'
} as const

const tierFor = (count: number) => {
  if (count === 1) return 'single'
  if (count < 5) return 'small'
  if (count < 15) return 'medium'
  return 'large'
}

export const ClusterMarker = memo(function ClusterMarker({
  lat,
  lng,
  count,
  label,
  onClick
}: {
  lat: number
  lng: number
  count: number
  label: string
  onClick: () => void
}) {
  const isSingle = count === 1
  const size = isSingle ? 10 : Math.min(54, 20 + count * 1.6)

  return (
    <OverlayViewF
      position={{ lat, lng }}
      mapPaneName={OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={(width, height) => ({ x: -(width / 2), y: -(height / 2) })}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          if (!isSingle) onClick()
        }}
        title={label}
        style={{ width: size, height: size, zIndex: count }}
        className={`flex items-center justify-center font-mono text-[11px] font-bold text-white transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${tierClass[tierFor(count)]} ${isSingle ? 'cursor-default' : 'cursor-pointer'}`}
      >
        {!isSingle && count}
      </button>
    </OverlayViewF>
  )
})
