'use client'

import { fadeUp } from 'lib/constants/motion.constants'
import { useUiSelector } from 'lib/store/store'
import { motion } from 'framer-motion'

const STEPS = [
  'We receive your application and contact your veterinarian and personal references.',
  'After obtaining references, a volunteer will contact you to schedule a virtual home visit via Zoom or FaceTime.',
  "During the home visit, we'll look at where a foster dog will eat, play, and sleep. Everyone in your home must be present.",
  "Once approved, we'll match you with a foster dog and provide a handbook covering all foster policies and procedures."
]

export default function FosterApplication() {
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
              Volunteer
            </p>
          </div>
          <h1 className="font-quicksand text-4xl sm:text-5xl font-bold text-text-light dark:text-text-dark leading-tight mb-5">
            Foster{' '}
            <span className="font-light text-muted-light dark:text-muted-dark">Application</span>
          </h1>
          <p className="text-base sm:text-lg text-primary-light dark:text-primary-dark font-semibold leading-relaxed">
            Fostering is our transitional step from a shelter or surrender to a forever home.
          </p>
        </motion.div>

        {/* ── About fostering ── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          custom={0}
          aria-labelledby="about-fostering"
          className="mb-12 sm:mb-16"
        >
          <div className="flex items-center gap-3 mb-3">
            <span
              className="block w-6 h-px bg-primary-light dark:bg-primary-dark shrink-0"
              aria-hidden="true"
            />
            <h2
              id="about-fostering"
              className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark"
            >
              About Fostering
            </h2>
          </div>
          <div className="space-y-4 text-sm text-muted-light dark:text-on-dark leading-relaxed">
            <p>
              During fostering, it&apos;s important that we give each dachshund a safe environment
              where the dog can learn to trust again, to heal, and to become a loving family member.
              Many of the dachshunds we pull from shelters or receive from owner surrenders just
              need a temporary home until their forever home can be found.
            </p>
            <p>
              Fostering is a rewarding experience but is a commitment. You may bring home a dog that
              was just pulled from a shelter or surrendered by their owner. Some fosters won&apos;t
              get along with your dogs while others warm up quickly. Some may be sick and need extra
              attention. But the reward when they go to their forever home is something you will
              never forget.
            </p>
            <p>
              LPDR is responsible for all vetting for foster dogs. This application takes 15–30
              minutes to complete.
            </p>
          </div>
        </motion.section>

        {/* ── What happens next ── */}
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          custom={0}
          aria-labelledby="process-heading"
          className="mb-12 sm:mb-16"
        >
          <div className="flex items-center gap-3 mb-3">
            <span
              className="block w-6 h-px bg-primary-light dark:bg-primary-dark shrink-0"
              aria-hidden="true"
            />
            <h2
              id="process-heading"
              className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark"
            >
              What Happens Next
            </h2>
          </div>
          <ol
            className="flex flex-col gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark"
            aria-label="Foster application process steps"
          >
            {STEPS.map((step, i) => (
              <motion.li
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-40px' }}
                custom={i * 0.5}
                className="bg-bg-light dark:bg-bg-dark p-5 sm:p-6 grid grid-cols-[40px_1fr] gap-4 items-start"
              >
                <span
                  className="font-mono text-xl font-bold text-primary-light dark:text-primary-dark leading-none pt-0.5"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-sm text-muted-light dark:text-on-dark leading-relaxed">{step}</p>
              </motion.li>
            ))}
          </ol>
        </motion.section>

        {/* ── Closing note ── */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          custom={0}
          className="text-center text-sm font-semibold text-text-light dark:text-text-dark mb-10 sm:mb-12"
        >
          We look forward to having you on the LPDR Foster Team!
        </motion.p>

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
              Foster Application
            </h2>
          </div>
          <div className="border border-border-light dark:border-border-dark overflow-hidden">
            {isDark ? (
              <iframe
                title="Foster Application"
                width="100%"
                className="h-150 sm:h-175 block"
                src="https://toolkit.rescuegroups.org/of/f?c=NXGDQBDV"
              />
            ) : (
              <iframe
                title="Foster Application"
                width="100%"
                className="h-150 sm:h-175 block"
                src="https://toolkit.rescuegroups.org/of/f?c=DGKQZWCQ"
              />
            )}
          </div>
        </motion.section>
      </div>
    </main>
  )
}
