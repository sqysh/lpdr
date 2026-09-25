'use client'

import { useCallback, useEffect, useState } from 'react'

export function useCarousel(count: number, { paused = false, intervalMs = 6000 }: { paused?: boolean; intervalMs?: number } = {}) {
  const [current, setCurrent] = useState(0)

  const goTo = useCallback((index: number) => setCurrent(((index % count) + count) % count), [count])
  const goNext = useCallback(() => setCurrent((c) => (c + 1) % count), [count])
  const goPrev = useCallback(() => setCurrent((c) => (c - 1 + count) % count), [count])

  // current is a dependency so a manual change restarts the timer, rather than the next slide
  // arriving a moment after someone chose one
  useEffect(() => {
    if (paused || count < 2) return
    const id = setInterval(() => setCurrent((c) => (c + 1) % count), intervalMs)
    return () => clearInterval(id)
  }, [paused, count, intervalMs, current])

  return { current, goTo, goNext, goPrev }
}
