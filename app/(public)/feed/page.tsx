'use client'

import { FeedAFosterCard } from 'app/(public)/feed/_components/FeedAFosterCard'
import { FEED_A_FOSTER_CONTENT } from 'lib/constants/feed-a-foster.constants'
import { fadeUp } from 'lib/constants/motion.constants'
import { motion } from 'framer-motion'

export default function FeedAFoster() {
  const now = new Date()
  const isAvailable = now.getMonth() === 6 // 0-indexed, 6 = July
  return (
    <main
      id="main-content"
      className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-24 sm:pb-32">
        {/* ── Header ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          className="mb-12 sm:mb-16 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <span
              className="block w-8 h-px bg-primary-light dark:bg-primary-dark"
              aria-hidden="true"
            />
            <p className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
              Feed A Foster
            </p>
            <span
              className="block w-8 h-px bg-primary-light dark:bg-primary-dark"
              aria-hidden="true"
            />
          </div>
          <h1 className="font-quicksand text-3xl sm:text-4xl lg:text-5xl font-bold text-text-light dark:text-text-dark leading-tight mb-4">
            July is Foster{' '}
            <span className="font-light text-muted-light dark:text-muted-dark">
              Appreciation Month
            </span>
          </h1>
          <p className="text-base text-muted-light dark:text-on-dark max-w-lg mx-auto leading-relaxed">
            {isAvailable
              ? 'Please join us and help Feed A Foster! We are hosting our annual fundraiser, right here, online.'
              : 'Our annual Feed a Foster fundraiser opens in July. Check back then to support our foster dogs!'}
          </p>
        </motion.div>

        {/* ── Cards ── */}
        <ul
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border-light dark:bg-border-dark"
          role="list"
          aria-label="Feed a Foster donation options"
        >
          {FEED_A_FOSTER_CONTENT.map((item, i) => (
            <FeedAFosterCard key={i} i={i} isAvailable={isAvailable} item={item} />
          ))}
        </ul>
      </div>
    </main>
  )
}
