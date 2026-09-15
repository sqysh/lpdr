'use client'

import { ReactNode, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

type Props = {
  children: ReactNode
  /** Position in its group. Multiplies the stagger so a column arrives in order. */
  index?: number
  className?: string
}

/**
 * One entrance for everything on the page. Each block watches itself rather than sharing a
 * single header ref, so content below the fold animates when it is reached instead of having
 * already played by the time it is scrolled to.
 */
export function Reveal({ children, index = 0, className }: Props) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.08, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
