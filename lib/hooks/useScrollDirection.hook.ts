'use client'

import { useState, useRef, useLayoutEffect, useEffect } from 'react'

export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export const useScrollDirection = () => {
  const [hidden, setHidden] = useState(false)
  const [isAtTop, setIsAtTop] = useState(true)
  const lastY = useRef(0)

  useIsomorphicLayoutEffect(() => {
    lastY.current = window.scrollY

    const onScroll = () => {
      const y = window.scrollY
      const atTop = y <= 0
      setIsAtTop(atTop)

      // ignore tiny jitters and rubber-banding
      if (Math.abs(y - lastY.current) < 6) return

      // hide when scrolling down (and past the header), reveal when scrolling up
      if (y > lastY.current && y > 40) {
        setHidden(true)
      } else {
        setHidden(false)
      }
      lastY.current = y
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return { hidden, isAtTop }
}
