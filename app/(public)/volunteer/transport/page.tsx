'use client'

import { fadeUp } from 'lib/constants/motion.constants'
import { useUiSelector } from 'lib/store/store'
import { motion } from 'framer-motion'

export default function TransportApplication() {
  const { isDark } = useUiSelector()
  return (
    <main
      id="main-content"
      className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-24 sm:pb-32">
        {/* ── Header ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          className="mb-12 sm:mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <span
              className="block w-8 h-px bg-primary-light dark:bg-primary-dark"
              aria-hidden="true"
            />
            <p className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
              Transport
            </p>
          </div>
          <h1 className="font-quicksand text-4xl sm:text-5xl font-bold text-text-light dark:text-text-dark leading-tight mb-5">
            Streamlining{' '}
            <span className="font-light text-muted-light dark:text-muted-dark">
              Dachshund Rescue Transport
            </span>
          </h1>
          <p className="text-base text-muted-light dark:text-on-dark leading-relaxed">
            This application supports Little Paws Dachshund Rescue by simplifying the logistics of
            moving rescued dachshunds between locations. It allows for seamless coordination of
            transport routes and volunteer assignments, ensuring that every dog reaches their new
            home with the utmost care and efficiency.
          </p>
        </motion.div>

        {/* ── Application iframe ── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          custom={0}
          aria-labelledby="application-heading"
        >
          <div className="flex items-center gap-3 mb-3">
            <span
              className="block w-6 h-px bg-primary-light dark:bg-primary-dark shrink-0"
              aria-hidden="true"
            />
            <h2
              id="application-heading"
              className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark"
            >
              Transport Application
            </h2>
          </div>
          <div className="border border-border-light dark:border-border-dark overflow-hidden">
            {isDark ? (
              <iframe
                title="Transport Application"
                width="100%"
                className="h-150 sm:h-175 block"
                src="https://toolkit.rescuegroups.org/of/f?c=JBFKVFVH"
              />
            ) : (
              <iframe
                title="Transport Application"
                width="100%"
                className="h-150 sm:h-175 block"
                src="https://toolkit.rescuegroups.org/of/f?c=PKYHTHRH"
              />
            )}
          </div>
        </motion.section>
      </div>
    </main>
  )
}
