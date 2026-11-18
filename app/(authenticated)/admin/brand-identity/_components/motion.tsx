'use client'

import type { ReactNode } from 'react'
import { motion, MotionConfig } from 'framer-motion'

// Both entrances are a slow fade, with a short rise or a settle. For visitors who prefer reduced motion, framer-motion drops the
// movement and keeps only the fade (`reducedMotion="user"`).

// One restrained entrance, once, as a section scrolls into view
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={className}
        initial={{ opacity: 0, y }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  )
}

// The opening: the logo settles out of the dark
export function Unveil({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className={className}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  )
}
