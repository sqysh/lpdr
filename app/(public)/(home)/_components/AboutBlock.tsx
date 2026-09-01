'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { container, imageReveal, item } from 'lib/constants/motion.constants'
import Picture from 'app/components/_common/Picture'

export const AboutBlock = () => {
  return (
    <section
      aria-labelledby="about-heading"
      className="relative w-full overflow-x-hidden bg-bg-light dark:bg-bg-dark"
    >
      {/* Texture background */}
      <div
        className="absolute inset-0 bg-repeat dark:opacity-20 pointer-events-none"
        style={{ backgroundImage: `url('/images/cubes.png')`, backgroundSize: '80px 80px' }}
        aria-hidden="true"
      />

      {/* Full width layout layer */}
      <div className="relative flex flex-col 1200:flex-row">
        {/* Image — reveals with a slow scale settle */}
        <motion.div
          variants={imageReveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="order-2 1200:order-1 relative w-full max-w-xl mx-auto mt-8 overflow-hidden 1200:absolute 1200:top-0 1200:left-0 1200:max-w-3xl 1200:w-[min(calc((100vw-75rem)/2+24rem),50vw)] 1200:mt-0 1200:mx-0 block"
        >
          <Picture
            priority={false}
            src="/images/geo-dachshund.png"
            alt="Geometric zentangle illustration of a dachshund"
            className="w-full h-full object-cover object-center opacity-20 dark:opacity-30 1200:pt-35"
          />
          <Picture
            priority={false}
            src="/images/geo-dachshund.png"
            alt=""
            aria-hidden="true"
            className="dachshund-tint absolute inset-0 w-full h-full object-cover object-center opacity-20 dark:opacity-30 1200:pt-35"
            style={{ clipPath: 'polygon(0 0, 100% 0, 0% 100%, 0 100%)' }}
          />
        </motion.div>

        {/* Content */}
        <div className="order-1 1200:order-2 mx-auto max-w-180 1000:max-w-240 1200:max-w-300 w-full px-4 xs:px-5 sm:px-6 pt-35 1200:py-35 1200:mb-68 grid grid-cols-12">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            className="col-span-12 1200:col-span-7 1200:col-start-6 space-y-5 sm:space-y-6"
          >
            {/* Eyebrow */}
            <motion.div variants={item} className="flex items-center gap-3" aria-hidden="true">
              <div className="w-6 sm:w-8 h-px bg-primary-light dark:bg-primary-dark shrink-0" />
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-tight text-muted-light dark:text-muted-dark font-nunito">
                About Little Paws
              </p>
            </motion.div>

            {/* Heading */}
            <motion.h2
              variants={item}
              id="about-heading"
              className="text-[28px] xs:text-[32px] sm:text-[36px] lg:text-[40px] font-light text-text-light dark:text-text-dark leading-tight font-quicksand"
            >
              <span className="font-black">Little Paws</span> Dachshund Rescue
            </motion.h2>

            {/* Body copy */}
            <motion.div variants={item} className="space-y-3 sm:space-y-4">
              <p className="font-nunito text-sm sm:text-base text-text-light dark:text-text-dark font-semibold leading-relaxed">
                We are a volunteer-based nonprofit dedicated to rescuing, rehabilitating, and
                rehoming dachshunds and dachshund mixes across the United States.
              </p>
              <p className="font-nunito text-sm sm:text-base text-muted-light dark:text-muted-dark leading-relaxed">
                Every dog in our care receives veterinary attention, foster love, and the chance at
                a forever home. We believe every dachshund deserves a safe, loving family.
              </p>
            </motion.div>

            {/* Stats — each cell staggers in as its own child */}
            <motion.dl
              variants={item}
              className="grid grid-cols-3 gap-3 xs:gap-5 sm:gap-8 pt-4 border-t border-border-light dark:border-border-dark"
            >
              {[
                { label: 'Dogs Rescued', value: '1,500' },
                { label: 'Adoptions', value: '1,200' },
                { label: 'Volunteers', value: '300' }
              ].map((stat) => (
                <div key={stat.label} className="pt-4 sm:pt-6">
                  <dd className="text-[clamp(1.75rem,6vw,3.75rem)] font-quicksand font-bold text-primary-light dark:text-primary-dark tabular-nums leading-none">
                    {stat.value}
                  </dd>
                  <dt className="font-nunito text-[10px] xs:text-xs sm:text-sm font-semibold text-stat-label-light dark:text-stat-label-dark mt-1 uppercase tracking-wide">
                    {stat.label}
                  </dt>
                </div>
              ))}
            </motion.dl>

            {/* CTA */}
            <motion.div variants={item} className="pt-1 sm:pt-2">
              <Link
                href="/about"
                aria-label="Learn more about Little Paws Dachshund Rescue"
                className="inline-flex items-center justify-center w-full xs:w-auto px-8 sm:px-11 py-3 sm:py-3.5 border-2 border-primary-light dark:border-primary-dark text-text-light dark:text-text-dark text-sm font-semibold font-nunito tracking-wide hover:bg-primary-light dark:hover:bg-primary-dark hover:text-white dark:hover:text-bg-dark transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2"
              >
                More about us
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
