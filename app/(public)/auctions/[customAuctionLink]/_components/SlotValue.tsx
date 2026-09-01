'use client'

import { useEffect, useRef, useState } from 'react'

const CHARS = '0123456789$., '

function SlotChar({ targetChar, spinning, delay }: { targetChar: string; spinning: boolean; delay: number }) {
  const charRef = useRef<HTMLSpanElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startRef = useRef<NodeJS.Timeout | null>(null)
  const stopRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!spinning) {
      if (charRef.current) charRef.current.textContent = targetChar
      return
    }

    let i = Math.floor(Math.random() * CHARS.length)

    startRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        if (charRef.current) {
          charRef.current.textContent = CHARS[i % CHARS.length]
          i++
        }
      }, 55)

      stopRef.current = setTimeout(() => {
        if (intervalRef.current) clearInterval(intervalRef.current)
        if (charRef.current) charRef.current.textContent = targetChar
      }, 400 + delay)
    }, delay)

    return () => {
      if (startRef.current) clearTimeout(startRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (stopRef.current) clearTimeout(stopRef.current)
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

export function SlotValue({ value, trigger }: { value: string; trigger: number }) {
  const [displayValue, setDisplayValue] = useState(value)
  const [spinning, setSpinning] = useState(false)
  const prevTrigger = useRef(trigger)
  const prevValue = useRef(value)

  useEffect(() => {
    if (trigger === prevTrigger.current) return
    prevTrigger.current = trigger

    const start = setTimeout(() => setSpinning(true), 0)
    return () => clearTimeout(start)
  }, [trigger])

  useEffect(() => {
    if (value === prevValue.current) return
    prevValue.current = value

    const stop = setTimeout(
      () => {
        setSpinning(false)
        setDisplayValue(value)
      },
      spinning ? 300 : 0
    )

    return () => clearTimeout(stop)
  }, [spinning, value])

  return (
    <div className="flex items-center leading-none text-text-light dark:text-text-dark">
      {displayValue.split('').map((char, i) => (
        <SlotChar key={i} targetChar={char} spinning={spinning} delay={i * 50} />
      ))}
    </div>
  )
}
