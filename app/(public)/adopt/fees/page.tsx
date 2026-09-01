'use client'

import Picture from 'components/_common/Picture'
import { fadeUp } from 'lib/constants/motion.constants'
import { motion } from 'framer-motion'

const adoptionFeeData = [
  'Spay or neuter',
  'Full veterinary health check',
  'Vaccinations: Rabies, Distemper Combo (not Lepto)',
  'Heartworm test (if found positive they undergo heartworm treatment)',
  'Dental cleaning (if necessary)',
  'Any additional medical treatment as necessary',
  'Microchip'
]

export default function AdoptionFees() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-24 sm:pb-32">
        {/* ── Page header ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          className="mb-14 sm:mb-20"
        >
          <div className="flex items-center gap-3 mb-4">
            <span
              className="block w-8 h-px bg-primary-light dark:bg-primary-dark"
              aria-hidden="true"
            />
            <p className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
              Adopt
            </p>
          </div>
          <h1 className="font-quicksand text-4xl sm:text-5xl font-bold text-text-light dark:text-text-dark leading-tight mb-5">
            Adoption <span className="font-light text-muted-light dark:text-muted-dark">Fees</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-light dark:text-on-dark leading-relaxed max-w-2xl">
            Affordable adoption with comprehensive vetting — for all dachshund breeds and mixes.
            Regardless of whether you adopt a purebred or mixed dachshund, vetting costs remain the
            same.
          </p>
        </motion.div>

        {/* ── Image + callout ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          custom={0}
          className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark mb-16 sm:mb-20"
        >
          <div className="aspect-square overflow-hidden bg-surface-light dark:bg-surface-dark">
            <Picture
              src="/images/random/img-2.jpg"
              alt="A dachshund ready for adoption through Little Paws Dachshund Rescue"
              className="w-full h-full object-cover object-center"
              priority={true}
            />
          </div>
          <div className="bg-surface-light dark:bg-surface-dark p-6 sm:p-8 flex flex-col justify-center gap-5">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="block w-6 h-px bg-primary-light dark:bg-primary-dark shrink-0"
                  aria-hidden="true"
                />
                <p className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
                  Peace of Mind
                </p>
              </div>
              <h2 className="font-quicksand text-xl sm:text-2xl font-bold text-text-light dark:text-text-dark leading-snug mb-3">
                Adopt with Confidence
              </h2>
              <p className="text-sm text-muted-light dark:text-on-dark leading-relaxed">
                Whether purebred or mixed, every dog comes with all-inclusive vetting. Adopting a
                fully vetted dog costs significantly less than buying one and covering the vetting
                expenses yourself.
              </p>
            </div>
            <div className="w-full h-px bg-border-light dark:bg-border-dark" aria-hidden="true" />
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="block w-6 h-px bg-primary-light dark:bg-primary-dark shrink-0"
                  aria-hidden="true"
                />
                <p className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
                  Finding Your Dog
                </p>
              </div>
              <p className="text-sm text-muted-light dark:text-on-dark leading-relaxed">
                The adoption fee for each dog is listed in their biography. Find each dog&apos;s
                profile by visiting{' '}
                <strong className="text-text-light dark:text-text-dark">
                  Dachshunds → Available
                </strong>{' '}
                in the menu. A health certificate is also the responsibility of the adopter when
                crossing state lines — cost depends on what the vet charges LPDR.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── What's included ── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          custom={0}
          aria-labelledby="fees-included-heading"
        >
          <div className="flex items-center gap-3 mb-3">
            <span
              className="block w-6 h-px bg-primary-light dark:bg-primary-dark shrink-0"
              aria-hidden="true"
            />
            <h2
              id="fees-included-heading"
              className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark"
            >
              What&apos;s Included
            </h2>
          </div>
          <p className="font-quicksand text-2xl sm:text-3xl font-bold text-text-light dark:text-text-dark mb-8">
            All adoption fees include
          </p>

          <ol
            className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark"
            aria-label="Items included in all adoption fees"
          >
            {adoptionFeeData.map((item, i) => (
              <motion.li
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-40px' }}
                custom={i % 4}
                className="bg-bg-light dark:bg-bg-dark p-5 sm:p-6 flex gap-4 items-start"
              >
                <span
                  className="font-mono text-xs text-muted-light dark:text-muted-dark shrink-0 pt-0.5 w-6"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-sm text-text-light dark:text-text-dark leading-relaxed">
                  {item}
                </p>
              </motion.li>
            ))}
          </ol>
        </motion.section>
      </div>
    </main>
  )
}
