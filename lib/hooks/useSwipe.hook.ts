import { useRef } from 'react'

const SWIPE_PX = 40

/** Horizontal swipes call onPrev or onNext. swiped reports whether the last touch was a swipe, so the tap that ends it can be ignored */
export function useSwipe(onPrev: () => void, onNext: () => void) {
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
