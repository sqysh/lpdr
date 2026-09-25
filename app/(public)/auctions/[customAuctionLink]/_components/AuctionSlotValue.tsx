'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

const CHARS = '0123456789$., '

function SlotChar({ targetChar, spinning, delay }: { targetChar: string; spinning: boolean; delay: number }) {
  const charRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!spinning) {
      if (charRef.current) charRef.current.textContent = targetChar
      return
    }

    let i = Math.floor(Math.random() * CHARS.length)
    let interval: ReturnType<typeof setInterval> | null = null
    let stop: ReturnType<typeof setTimeout> | null = null

    const start = setTimeout(() => {
      interval = setInterval(() => {
        if (charRef.current) charRef.current.textContent = CHARS[i++ % CHARS.length]
      }, 55)

      stop = setTimeout(() => {
        if (interval) clearInterval(interval)
        if (charRef.current) charRef.current.textContent = targetChar
      }, 400 + delay)
    }, delay)

    return () => {
      clearTimeout(start)
      if (interval) clearInterval(interval)
      if (stop) clearTimeout(stop)
    }
  }, [spinning, targetChar, delay])

  return (
    <span
      ref={charRef}
      className="inline-block font-mono font-black text-sm xs:text-base leading-none tabular-nums"
      style={{ minWidth: targetChar === ' ' ? '0.25em' : '0.62em' }}
    >
      {targetChar}
    </span>
  )
}

/**
 * Spins when the value changes, so the animation always lands on the new total. Each change starts
 * and stops its own spin, which means nothing can leave it stuck mid-spin.
 */
export function AuctionSlotValue({ value }: { value: string }) {
  const reduceMotion = useReducedMotion()
  const [spinning, setSpinning] = useState(false)
  const prevValue = useRef(value)

  useEffect(() => {
    if (value === prevValue.current) return
    prevValue.current = value
    if (reduceMotion) return

    // Long enough for the last character, which starts and stops latest, to settle
    const start = setTimeout(() => setSpinning(true), 0)
    const stop = setTimeout(() => setSpinning(false), 450 + value.length * 100)

    return () => {
      clearTimeout(start)
      clearTimeout(stop)
    }
  }, [value, reduceMotion])

  return (
    <span className="flex items-center leading-none text-text-light dark:text-text-dark">
      <span className="sr-only">{value}</span>
      <span className="flex items-center" aria-hidden="true">
        {value.split('').map((char, i) => (
          <SlotChar key={i} targetChar={char} spinning={spinning} delay={i * 50} />
        ))}
      </span>
    </span>
  )
}
