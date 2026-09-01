'use client'

import { motion } from 'framer-motion'
import { fadeUp } from 'lib/constants/motion.constants'
import { useCountdown } from 'lib/hooks/useCountdown.hook'

type Props = {
  expiresAt: Date
}

export function ApplicationExpiryTimer({ expiresAt }: Props) {
  const { days, hours, minutes, seconds, done } = useCountdown(expiresAt)

  const timeLeft = done
    ? 'Expired'
    : days > 0
      ? `${days}d ${hours}h ${minutes}m`
      : `${hours}h ${minutes}m ${seconds}s`

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1} className="mb-8">
      <div
        className={`flex items-center justify-between px-4 py-3 border ${
          done
            ? 'border-red-500/30 bg-red-50 dark:bg-red-500/5'
            : 'border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark'
        }`}
        role="timer"
        aria-label={`Application access expires in ${timeLeft}`}
      >
        <div className="flex items-center gap-2">
          <span
            className="block w-3 h-px bg-primary-light dark:bg-primary-dark"
            aria-hidden="true"
          />
          <p className="text-xs font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
            Access Expires
          </p>
        </div>
        <p
          className={`text-sm uppercase tracking-wide tabular-nums ${
            done ? 'text-red-500 dark:text-red-400' : 'text-primary-light dark:text-primary-dark'
          }`}
        >
          {timeLeft}
        </p>
      </div>
    </motion.div>
  )
}
