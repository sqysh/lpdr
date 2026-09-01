'use client'

import { SectionLabel } from 'components/_primitives'
import {
  ADOPTION_GUIDELINES_AND_REQUIREMENTS,
  FIVE_STEP_PROCESS,
  STATES_WE_RESCUE
} from 'lib/constants/adopt-info.page.constants'
import { fadeUp } from 'lib/constants/motion.constants'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AdoptionInformation() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-24 sm:pb-32 space-y-20 sm:space-y-28">
        {/* ── Page header ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
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
            Adoption{' '}
            <span className="font-light text-muted-light dark:text-muted-dark">Information</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-light dark:text-on-dark leading-relaxed max-w-2xl">
            You are considering adopting a dog that is intelligent, loyal, fun loving, full of love,
            and more than likely very vocal. A dachshund will bring you so much enjoyment, fun, and
            fulfillment every single day.
          </p>
        </motion.div>

        {/* ── Adopting is a big decision ── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          custom={0}
          aria-labelledby="decision-heading"
          className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark"
        >
          <div className="bg-surface-light dark:bg-surface-dark p-6 sm:p-8 flex flex-col justify-center gap-4">
            <SectionLabel className="mb-3">A Big Decision</SectionLabel>
            <h2
              id="decision-heading"
              className="font-quicksand text-2xl sm:text-3xl font-bold text-text-light dark:text-text-dark leading-snug"
            >
              We are committed to finding each dachshund a responsible and loving home.
            </h2>
            <p className="text-sm text-muted-light dark:text-on-dark leading-relaxed">
              We strive to make the best match we can, setting each dog and adopter up for success.
              Our number one concern is for our dogs. We require all individuals to read each
              dog&apos;s bio completely to ensure the dog of interest is the best match for your
              family and that the dog&apos;s needs can be met.
            </p>
          </div>
          <div className="bg-bg-light dark:bg-bg-dark p-6 sm:p-8 flex flex-col gap-4">
            <SectionLabel className="mb-3">Requirements</SectionLabel>
            <h2 className="font-quicksand text-lg font-bold text-text-light dark:text-text-dark mb-2">
              Guidelines we strongly adhere to
            </h2>
            <ul className="space-y-3" role="list">
              {ADOPTION_GUIDELINES_AND_REQUIREMENTS.map((req, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-muted-light dark:text-on-dark"
                >
                  <span
                    className="w-1.5 h-1.5  bg-primary-light dark:bg-primary-dark shrink-0 mt-1.5"
                    aria-hidden="true"
                  />
                  {req}
                </li>
              ))}
            </ul>
          </div>
        </motion.section>

        {/* ── Adopting a Puppy ── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          custom={0}
          aria-labelledby="puppy-heading"
        >
          <SectionLabel className="mb-3">Adopting a Puppy</SectionLabel>
          <h2
            id="puppy-heading"
            className="font-quicksand text-2xl sm:text-3xl font-bold text-text-light dark:text-text-dark mb-4"
          >
            What to Know Before You Apply
          </h2>

          <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-5 sm:p-6 mb-8">
            <p className="text-sm sm:text-base text-muted-light dark:text-on-dark leading-relaxed">
              The general guideline is that puppies may be left alone for no longer in hours than
              the number of months of their age.{' '}
              <strong className="text-text-light dark:text-text-dark">
                Puppies require extensive attention, especially initially.
              </strong>{' '}
              Please consider a young adult if your schedule doesn&apos;t permit frequent puppy
              breaks.
            </p>
          </div>

          {/* 5-step process */}
          <ol
            className="flex flex-col gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark"
            aria-label="Five step adoption process"
          >
            {FIVE_STEP_PROCESS.map((step, i) => (
              <motion.li
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-40px' }}
                custom={i * 0.5}
                className="bg-bg-light dark:bg-bg-dark p-5 sm:p-6 grid grid-cols-[48px_1fr] gap-4 items-start"
              >
                <span
                  className="font-mono text-2xl font-bold text-primary-light dark:text-primary-dark leading-none pt-0.5"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="font-semibold text-text-light dark:text-text-dark mb-1">
                    {step.titleKey}
                  </p>
                  <p className="text-sm text-muted-light dark:text-on-dark leading-relaxed">
                    {step.text}
                    {step.text2 && <> {step.text2}</>}
                    {step.text3 && <> {step.text3}</>}
                  </p>
                  {'path' in step && step.path && (
                    <Link
                      href={step.path}
                      className="inline-block mt-3 text-xs font-mono tracking-widest uppercase text-primary-light dark:text-primary-dark hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                    >
                      {step.linkKey} →
                    </Link>
                  )}
                </div>
              </motion.li>
            ))}
          </ol>
        </motion.section>

        {/* ── States we rescue ── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          custom={0}
          aria-labelledby="states-heading"
        >
          <SectionLabel className="mb-3">Service Area</SectionLabel>
          <h2
            id="states-heading"
            className="font-quicksand text-2xl sm:text-3xl font-bold text-text-light dark:text-text-dark mb-6"
          >
            States We Rescue In
          </h2>
          <div className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-5 sm:p-6">
            <ul
              className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2"
              role="list"
              aria-label="States where Little Paws Dachshund Rescue operates"
            >
              {STATES_WE_RESCUE.map((state) => (
                <li
                  key={state}
                  className="flex items-center gap-2 text-sm text-text-light dark:text-text-dark"
                >
                  <span
                    className="w-1.5 h-1.5  bg-primary-light dark:bg-primary-dark shrink-0"
                    aria-hidden="true"
                  />
                  {state}
                </li>
              ))}
            </ul>
          </div>
        </motion.section>

        {/* ── Transportation ── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          custom={0}
          aria-labelledby="transport-heading"
        >
          <SectionLabel className="mb-3">Transportation</SectionLabel>
          <h2
            id="transport-heading"
            className="font-quicksand text-2xl sm:text-3xl font-bold text-text-light dark:text-text-dark mb-4"
          >
            Getting Your Dog Home
          </h2>
          <p className="text-sm text-muted-light dark:text-on-dark leading-relaxed mb-6">
            We do not have a physical location — all our dogs are fostered in individual homes on
            the east coast. A LPDR volunteer transport may be arranged to bring a dog to you;
            however, the distance must be reasonable.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark mb-6">
            <div className="bg-surface-light dark:bg-surface-dark p-5 sm:p-6">
              <h3 className="text-xs font-mono tracking-widest uppercase text-primary-light dark:text-primary-dark mb-3">
                Travel Restrictions
              </h3>
              <ul className="space-y-2 text-sm text-muted-light dark:text-on-dark" role="list">
                <li className="flex items-start gap-2">
                  <span
                    className="w-1.5 h-1.5  bg-primary-light dark:bg-primary-dark shrink-0 mt-1.5"
                    aria-hidden="true"
                  />
                  Dogs in the south may not be available for transport to northern states and vice
                  versa.
                </li>
                <li className="flex items-start gap-2">
                  <span
                    className="w-1.5 h-1.5  bg-primary-light dark:bg-primary-dark shrink-0 mt-1.5"
                    aria-hidden="true"
                  />
                  Dogs in southern Florida and southern Georgia have travel restrictions limited to
                  Florida and parts of South Carolina.
                </li>
              </ul>
            </div>
            <div className="bg-surface-light dark:bg-surface-dark p-5 sm:p-6">
              <h3 className="text-xs font-mono tracking-widest uppercase text-primary-light dark:text-primary-dark mb-3">
                Transport Costs
              </h3>
              <ul className="space-y-2 text-sm text-muted-light dark:text-on-dark" role="list">
                <li className="flex items-start gap-2">
                  <span
                    className="w-1.5 h-1.5  bg-primary-light dark:bg-primary-dark shrink-0 mt-1.5"
                    aria-hidden="true"
                  />
                  Includes health certificate required by law when crossing state lines.
                </li>
                <li className="flex items-start gap-2">
                  <span
                    className="w-1.5 h-1.5  bg-primary-light dark:bg-primary-dark shrink-0 mt-1.5"
                    aria-hidden="true"
                  />
                  Certificate costs vary and may exceed adoption fees in some cases.
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark p-5 sm:p-6">
            <p className="text-sm text-muted-light dark:text-on-dark leading-relaxed">
              We will inform you if the dog you applied for is not able to travel long distances.
              Adopters are also welcome to travel to their newly adopted dog to bring them home — a
              crate for safe transport would be the responsibility of the adopter.
            </p>
          </div>
        </motion.section>
      </div>
    </main>
  )
}
