'use client'

import { fadeUp } from 'lib/constants/motion.constants'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useThemeStore } from 'stores/theme.store'

export function VolunteerApplicationClient() {
  const isDark = useThemeStore((s) => s.isDark)

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
              Volunteer
            </p>
          </div>
          <h1 className="font-quicksand text-4xl sm:text-5xl font-bold text-text-light dark:text-text-dark leading-tight mb-5">
            Get <span className="font-light text-muted-light dark:text-muted-dark">Involved</span>
          </h1>
          <p className="text-base text-muted-light dark:text-on-dark leading-relaxed">
            Thank you for applying to volunteer with Little Paws Dachshund Rescue. This application
            takes 15–30 minutes to complete. We rely on our volunteers to accomplish our mission of
            helping unwanted and abandoned animals find new homes.
          </p>
        </motion.div>

        {/* ── Ways to help ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          custom={0}
          className="grid grid-cols-1 xs:grid-cols-3 gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark mb-12 sm:mb-16"
        >
          {[
            {
              label: 'Donate',
              description: 'Support our rescue financially.',
              href: '/donate'
            },
            {
              label: 'Shop to Help',
              description: 'Give while doing daily shopping.',
              href: '/donate/shop-to-help'
            },
            {
              label: 'Auctions',
              description: 'Artists & crafters needed.',
              href: '/auctions'
            }
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group bg-surface-light dark:bg-surface-dark p-5 flex flex-col gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              <span className="text-xs font-mono tracking-widest uppercase text-primary-light dark:text-primary-dark group-hover:underline">
                {item.label} →
              </span>
              <span className="text-xs text-muted-light dark:text-on-dark">{item.description}</span>
            </Link>
          ))}
        </motion.div>

        {/* ── Join the family ── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          custom={0}
          aria-labelledby="join-heading"
          className="mb-12 sm:mb-16"
        >
          <div className="flex items-center gap-3 mb-3">
            <span
              className="block w-6 h-px bg-primary-light dark:bg-primary-dark shrink-0"
              aria-hidden="true"
            />
            <h2
              id="join-heading"
              className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark"
            >
              Join the Family
            </h2>
          </div>
          <p className="text-sm text-muted-light dark:text-on-dark leading-relaxed mb-4">
            We are always seeking new volunteers and fosters. Visit our{' '}
            <Link
              href="/volunteer/foster-application"
              className="text-primary-light dark:text-primary-dark hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              Foster Application
            </Link>{' '}
            or complete the Volunteer Application below.
          </p>
          <p className="text-sm text-muted-light dark:text-on-dark leading-relaxed">
            Are you crafty? We are looking for artists and crafters for our{' '}
            <Link
              href="/auctions"
              className="text-primary-light dark:text-primary-dark hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              upcoming auctions
            </Link>
            .
          </p>
        </motion.section>

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
              Volunteer Application
            </h2>
          </div>
          <div className="border border-border-light dark:border-border-dark overflow-hidden">
            {isDark ? (
              <iframe
                title="Volunteer Application - dark mode"
                width="100%"
                className="h-150 sm:h-175 block"
                src="https://toolkit.rescuegroups.org/of/f?c=WCVGSBQJ"
              />
            ) : (
              <iframe
                title="Volunteer Application - light mode"
                width="100%"
                className="h-150 sm:h-175 block"
                src="https://toolkit.rescuegroups.org/of/f?c=FPGYBJHM"
              />
            )}
          </div>
        </motion.section>
      </div>
    </main>
  )
}
