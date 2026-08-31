'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { containerVariants, itemVariants } from 'lib/constants/motion.constants'

const APPLICATIONS = [
  {
    id: 'adopt',
    label: 'Adoption',
    heading: 'Adopt',
    description:
      'Give a dachshund their forever home. Browse our available dogs and start your application today.',
    href: '/adopt/application',
    cta: 'Apply to Adopt'
  },
  {
    id: 'surrender',
    label: 'Surrender',
    heading: 'Surrender',
    description: `Sometimes rehoming is necessary. We understand, and we're here to help find your dog a safe place.`,
    href: '/dachshunds/surrender',
    cta: 'Learn More'
  },
  {
    id: 'volunteer',
    label: 'Volunteer',
    heading: 'Volunteer',
    description: `Join our team of dedicated volunteers. Every hour you give makes a difference in a dog's life.`,
    href: '/volunteer/application',
    cta: 'Apply to Volunteer'
  },
  {
    id: 'foster',
    label: 'Foster',
    heading: 'Foster',
    description:
      'Open your home temporarily to a dog in need. Fostering saves lives and prepares dogs for adoption.',
    href: '/volunteer/foster',
    cta: 'Apply to Foster'
  },
  {
    id: 'transportation',
    label: 'Transportation',
    heading: 'Transport',
    description:
      'Help move dogs safely between locations. Drivers and coordinators are always needed.',
    href: '/volunteer/transport',
    cta: 'Apply to Transport'
  }
]

export function ApplicationsBlock() {
  return (
    <section
      aria-labelledby="applications-heading"
      className="w-full bg-bg-light dark:bg-bg-dark border-t border-border-light dark:border-border-dark"
    >
      <div className="max-w-300 mx-auto px-4 xs:px-5 sm:px-6 py-10 sm:py-16 1200:py-20">
        {/* Header */}
        <div className="mb-10 sm:mb-14">
          <div className="flex items-center gap-3 mb-3">
            <span
              className="block w-6 h-px bg-primary-light dark:bg-primary-dark shrink-0"
              aria-hidden="true"
            />
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
              Get Involved
            </p>
          </div>
          <h2
            id="applications-heading"
            className="font-quicksand text-text-light dark:text-text-dark leading-tight"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}
          >
            <span className="font-black">WAYS TO</span>{' '}
            <span className="font-light">GET INVOLVED</span>
          </h2>
        </div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          role="list"
          aria-label="Available applications"
          className="grid grid-cols-1 xs:grid-cols-2 1000:grid-cols-5 gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark"
        >
          {APPLICATIONS.map((app) => (
            <motion.div
              key={app.id}
              variants={itemVariants}
              role="listitem"
              className="bg-bg-light dark:bg-bg-dark"
            >
              <Link
                href={app.href}
                aria-label={`${app.cta} — ${app.description}`}
                className="group flex flex-col h-full px-5 py-6 sm:py-8 hover:bg-surface-light dark:hover:bg-surface-dark transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                {/* Index */}
                <span
                  className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-4"
                  aria-hidden="true"
                >
                  {String(APPLICATIONS.indexOf(app) + 1).padStart(2, '0')}
                </span>

                {/* Heading */}
                <h3 className="font-quicksand font-black text-2xl sm:text-3xl text-text-light dark:text-text-dark leading-none mb-3 group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors duration-200">
                  {app.heading}
                </h3>

                {/* Label */}
                <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark mb-4">
                  {app.label}
                </p>

                {/* Description */}
                <p className="text-xs font-mono text-muted-light dark:text-muted-dark leading-relaxed flex-1 mb-6">
                  {app.description}
                </p>

                {/* CTA */}
                <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase text-text-light dark:text-text-dark group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors duration-200">
                  {app.cta}
                  <ArrowRight
                    size={11}
                    className="group-hover:translate-x-0.5 transition-transform duration-200"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
