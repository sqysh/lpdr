'use client'

import Picture from 'app/components/_common/Picture'
import { fadeUp } from 'lib/constants/motion.constants'
import { motion } from 'framer-motion'

const reasonsToAdoptASeniorData = [
  {
    title: 'Housetrained',
    reason:
      'Older dogs are housetrained. You won’t have to go through the difficult state(s) of teaching a puppy house manners and mopping/cleaning up after accidents.'
  },
  {
    title: 'Won’t chew inappropriate items',
    reason:
      'Older dogs are not teething puppies and won’t chew your shoes and furniture while growing up.'
  },
  {
    title: 'Focus to learn',
    reason: 'Older dogs can focus well because they’ve mellowed. Therefore, they learn quickly.'
  },
  {
    title: 'Know what “No” means',
    reason:
      'Older dogs have learned what “no” means. If they hadn’t learned it, they wouldn’t have gotten to be “older” dogs.'
  },
  {
    title: 'Settle in with the “pack”',
    reason:
      'Older dogs settle in easily because they’ve learned what it takes to get along with others and become part of a pack.'
  },
  {
    title: 'Good at giving love',
    reason:
      'Older dogs are good at giving love once they get into their new, loving home. They are grateful for the second chance they’ve been given.'
  },
  {
    title: 'What you see is what you get',
    reason:
      'Unlike puppies, older dogs have grown into their shape and personality. Puppies can grow up to be quite different from what they seemed at first.'
  },
  {
    title: 'Instant Companions',
    reason:
      'Older dogs are instant companions – ready for hiking, car trips and other things you like to do.'
  },
  {
    title: 'Time for yourself',
    reason:
      'Older dogs leave you time for yourself because they don’t make the kinds of demands on your time and attention that puppies and young dogs do.'
  },
  {
    title: 'A good night’s sleep',
    reason:
      'Older dogs let you get a good night’s sleep because they’re accustomed to human schedules and don’t generally need nighttime feedings, comforting or bathroom breaks.'
  }
]

export function AdoptASeniorClient() {
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
              Program
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-16 items-end">
            <div>
              <h1 className="font-quicksand text-4xl sm:text-5xl font-bold text-text-light dark:text-text-dark leading-tight mb-5">
                Adopt a{' '}
                <span className="font-light text-muted-light dark:text-muted-dark">Senior</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-light dark:text-on-dark leading-relaxed max-w-xl">
                The{' '}
                <strong className="text-primary-light dark:text-primary-dark font-semibold">
                  Long on Love Senior Program
                </strong>{' '}
                is a way for experienced pet owners age 60 and older to find a loving senior
                dachshund to join their home. Dachshunds can live to be 18 years old — senior
                dachshunds still have lots of love to give.
              </p>
            </div>

            {/* Fee card */}
            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-6 flex flex-col gap-4">
              <div>
                <p className="text-xs font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark mb-1">
                  Senior-to-Senior Adoption Fee
                </p>
                <p className="font-quicksand text-4xl font-bold text-primary-light dark:text-primary-dark">
                  $125.00
                </p>
              </div>
              <div className="w-full h-px bg-border-light dark:bg-border-dark" aria-hidden="true" />
              <ul className="space-y-1.5 text-xs text-muted-light dark:text-on-dark" role="list">
                {[
                  'Spay / Neuter',
                  'Rabies & Distemper shots',
                  'Microchip implant',
                  'Dental if needed'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5  bg-primary-light dark:bg-primary-dark shrink-0"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                Must show proof of age 60+
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Image + about ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          custom={0}
          className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border-light dark:bg-border-dark mb-16 sm:mb-20"
        >
          <div className="aspect-square overflow-hidden bg-surface-light dark:bg-surface-dark">
            <Picture
              src="/images/random/img-2.webp"
              alt="A senior dachshund available for adoption through the Long on Love program"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="bg-surface-light dark:bg-surface-dark p-6 sm:p-8 flex flex-col justify-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="block w-6 h-px bg-primary-light dark:bg-primary-dark shrink-0"
                  aria-hidden="true"
                />
                <h2 className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
                  About the Program
                </h2>
              </div>
              <p className="text-sm text-muted-light dark:text-on-dark leading-relaxed">
                Little Paws Dachshund Rescue encourages experienced pet owners to adopt by offering
                a discounted adoption fee to seniors 60 and older who adopt a senior dachshund or
                dachshund mix from our rescue.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="block w-6 h-px bg-primary-light dark:bg-primary-dark shrink-0"
                  aria-hidden="true"
                />
                <h2 className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
                  How They Come to Us
                </h2>
              </div>
              <p className="text-sm text-muted-light dark:text-on-dark leading-relaxed">
                LPDR receives senior dachshunds from shelters and owner surrenders — death of an
                owner, new babies, moves, allergies, and other life changes. These dogs have given
                their love to someone their entire lives and deserve a second chance.
              </p>
            </div>
            <div className="border border-border-light dark:border-border-dark p-4 bg-bg-light dark:bg-bg-dark">
              <p className="text-xs text-muted-light dark:text-on-dark leading-relaxed">
                To qualify, you must show proof of age and have a care plan in place. Senior animals
                are identified on our website with the notation{' '}
                <strong className="text-text-light dark:text-text-dark">
                  &quot;I am part of the Long on Love Senior Program.&quot;
                </strong>
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Divider ── */}
        <div
          className="w-full h-px bg-border-light dark:bg-border-dark mb-14 sm:mb-18"
          aria-hidden="true"
        />

        {/* ── Top 10 reasons ── */}
        <section aria-labelledby="reasons-heading">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            custom={0}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-3">
              <span
                className="block w-6 h-px bg-primary-light dark:bg-primary-dark shrink-0"
                aria-hidden="true"
              />
              <h2
                id="reasons-heading"
                className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark"
              >
                Top 10 Reasons
              </h2>
            </div>
            <p className="font-quicksand text-2xl sm:text-3xl font-bold text-text-light dark:text-text-dark">
              Why Adopt an Older Dog
            </p>
          </motion.div>

          <ol
            className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark"
            aria-label="10 reasons to adopt a senior dog"
          >
            {reasonsToAdoptASeniorData.map((item, i) => (
              <motion.li
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-40px' }}
                custom={i % 4}
                className="bg-bg-light dark:bg-bg-dark p-5 sm:p-6 flex gap-4"
              >
                <span
                  className="font-mono text-xs text-muted-light dark:text-muted-dark shrink-0 pt-0.5 w-6"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="font-semibold text-sm text-text-light dark:text-text-dark mb-1">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-light dark:text-on-dark leading-relaxed">
                    {item.reason}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  )
}
