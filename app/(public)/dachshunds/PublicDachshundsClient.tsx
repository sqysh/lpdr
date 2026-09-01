'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { containerVariants } from 'lib/constants/motion.constants'
import { DogCard } from 'components/features/dachshunds/DogCard'

export default function PublicDachshundsClient({ data }) {
  return (
    <section
      aria-labelledby="adopt-heading"
      className="bg-bg-light dark:bg-bg-dark py-12 sm:py-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-180 1000:max-w-240 1200:max-w-300 mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span
              className="block w-8 h-px bg-primary-light dark:bg-primary-dark"
              aria-hidden="true"
            />
            <p className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
              Available Now
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <h1
              id="adopt-heading"
              className="font-quicksand text-3xl sm:text-4xl font-bold text-text-light dark:text-text-dark"
            >
              Find Your{' '}
              <span className="font-light text-muted-light dark:text-muted-dark">
                Forever Wiener
              </span>
            </h1>
            <p className="text-sm text-muted-light dark:text-muted-dark font-mono">
              {data?.data?.data?.length} dog{data?.data?.data?.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {data?.data?.data?.length > 0 ? (
            <motion.ul
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2"
              role="list"
              aria-label="Available dachshunds"
            >
              {data?.data?.data?.map((dog, i: number) => (
                <DogCard key={dog.id} dog={dog} index={i} />
              ))}
            </motion.ul>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-24 text-center"
              role="status"
              aria-live="polite"
            >
              <p className="text-muted-light dark:text-muted-dark font-mono text-sm">
                No dogs found in this category.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
