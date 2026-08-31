'use client'

import { containerVariants, rowVariants } from 'lib/constants/motion.constants'
import { motion } from 'framer-motion'
import Link from 'next/link'

type HelpRow = {
  id: number
  label: string
  description: string
  cost: string
  href: string
  cta: string
  free?: boolean
}

const ROWS: HelpRow[] = [
  {
    id: 1,
    label: 'Spread the Word',
    description: 'Share our dogs on social media',
    cost: 'Free',
    href: 'https://www.instagram.com/littlepawsdr',
    cta: '',
    free: true
  },
  {
    id: 2,
    label: 'One-Time Donation',
    description: 'Any amount helps cover vet care',
    cost: '$5+',
    href: '/donate',
    cta: 'Donate Now'
  },
  {
    id: 3,
    label: 'Welcome Wiener',
    description: "Sponsor a dog's profile and help them get noticed",
    cost: '$10+',
    href: '/welcome-wieners',
    cta: 'Boost a Dog'
  },
  {
    id: 4,
    label: 'Monthly Sponsor',
    description: 'Set up a recurring monthly donation to support a dog in care',
    cost: '$10+ / mo',
    href: '/donate',
    cta: 'Sponsor'
  },
  {
    id: 5,
    label: 'Shop Merch',
    description: 'Dachshund gear where every purchase gives back',
    cost: 'Varies',
    href: '/merch',
    cta: 'Shop Now'
  },
  {
    id: 6,
    label: 'Bid at Auction',
    description: 'Win unique items while funding our mission',
    cost: 'Your Bid',
    href: '/auction',
    cta: 'View Auction'
  },
  {
    id: 7,
    label: 'Adopt',
    description: 'Give a dachshund a forever home',
    cost: '$15 app fee',
    href: '/dachshunds',
    cta: 'Apply'
  },
  ...(new Date().getMonth() === 6
    ? [
        {
          id: 8,
          label: 'Feed a Foster',
          description: 'Sponsor food and supplies for a foster pup',
          cost: '$15–$50',
          href: '/feed',
          cta: 'Donate'
        }
      ]
    : [])
]

export const WaysToHelpBlock = () => {
  return (
    <section
      aria-labelledby="ways-to-help-heading"
      className="relative w-full py-10 sm:py-20 1200:py-34.75 bg-bg-light dark:bg-bg-dark px-4 xs:px-5 sm:px-6"
    >
      {/* Texture */}
      <div
        className="absolute inset-0 bg-repeat opacity-40 dark:opacity-20 pointer-events-none"
        style={{ backgroundImage: `url('/images/cubes.png')`, backgroundSize: '60px 60px' }}
        aria-hidden="true"
      />

      <div className="relative max-w-300 mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14 1200:mb-16 space-y-2">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
            Ways to Help
          </p>
          <h2
            id="ways-to-help-heading"
            className="font-quicksand text-text-light dark:text-text-dark leading-tight"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}
          >
            <span className="font-black">SUPPORT</span>{' '}
            <span className="font-light">LITTLE PAWS RESCUE</span>
          </h2>
        </div>

        {/* Column headers — hidden on mobile */}
        <div
          className="hidden sm:flex sm:items-center gap-3 sm:gap-6 px-5 sm:px-8 pb-3 border-b border-border-light dark:border-border-dark"
          aria-hidden="true"
        >
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
              Initiative
            </span>
          </div>
          <div className="sm:w-36 shrink-0">
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
              Cost
            </span>
          </div>
          <div className="sm:w-40 shrink-0 flex sm:justify-end">
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
              Action
            </span>
          </div>
        </div>

        {/* Rows */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          role="list"
          aria-label="Ways to support Little Paws Dachshund Rescue"
          className="space-y-0"
        >
          {ROWS.map((row, i) => {
            const isShaded = i % 2 === 0
            return (
              <motion.div
                key={row.id}
                variants={rowVariants}
                role="listitem"
                className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 px-4 xs:px-5 sm:px-8 py-4 sm:py-5 1200:py-6 border-b border-border-light dark:border-border-dark transition-colors ${
                  isShaded ? 'bg-surface-light dark:bg-surface-dark' : 'bg-transparent'
                }`}
              >
                {/* Label + description */}
                <div className="flex-1 min-w-0">
                  <p className="font-quicksand font-bold text-sm sm:text-base 1200:text-lg text-text-light dark:text-text-dark">
                    {row.label}
                  </p>
                  <p className="font-nunito text-xs sm:text-sm text-muted-light dark:text-muted-dark mt-0.5 leading-relaxed">
                    {row.description}
                  </p>
                </div>

                {/* Cost + CTA — inline on mobile, separate columns on sm+ */}
                <div className="flex items-center justify-between sm:contents gap-4">
                  {/* Cost */}
                  <div className="sm:w-36 shrink-0">
                    <span
                      className={`text-[10px] font-mono tracking-[0.2em] uppercase tabular-nums ${
                        row.free
                          ? 'text-muted-light dark:text-muted-dark'
                          : 'text-primary-light dark:text-primary-dark'
                      }`}
                    >
                      {row.cost}
                    </span>
                  </div>

                  {/* CTA */}
                  <div className="sm:w-40 shrink-0 flex sm:justify-end">
                    {row.cta ? (
                      <Link
                        href={row.href}
                        aria-label={`${row.cta} — ${row.label}`}
                        className="group relative text-[10px] font-mono tracking-[0.2em] uppercase text-text-light dark:text-text-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark whitespace-nowrap pb-0.5"
                      >
                        {row.cta}
                        <span
                          className="absolute bottom-0 left-0 w-0 group-hover:w-full h-px bg-primary-light dark:bg-primary-dark transition-all duration-300"
                          aria-hidden="true"
                        />
                      </Link>
                    ) : (
                      <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
                        Just share the love
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
