import { useCallback, useEffect, useState } from 'react'

export function useCarousel(count: number, interval = 5500) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const goTo = useCallback((i: number) => setCurrent((i + count) % count), [count])
  const goNext = useCallback(() => goTo(current + 1), [current, goTo])
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo])

  useEffect(() => {
    if (paused) return
    const id = setInterval(goNext, interval)
    return () => clearInterval(id)
  }, [goNext, paused, interval])

  return { current, goTo, goNext, goPrev, setPaused }
}
