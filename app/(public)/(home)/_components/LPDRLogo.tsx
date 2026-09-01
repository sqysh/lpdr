'use client'

import { motion } from 'framer-motion'
import { useUiSelector } from 'lib/store/store'

export const LPDRLogo = () => {
  const { isDark } = useUiSelector()

  const gradient = isDark
    ? 'linear-gradient(135deg, #38bdf8, #a78bfa, #38bdf8, #7c3aed)'
    : 'linear-gradient(135deg, #0891b2, #7c3aed, #0891b2, #0e7490)'

  return (
    <div className="bg-bg-light dark:bg-bg-dark" aria-label="Little Paws Dachshund Rescue">
      <style>{`

        .logo-gradient {
          background: ${gradient};
          background-size: 300% 300%;
          animation: gradient-shift 6s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-260 1200:max-w-300 mx-auto w-full px-4 xs:px-5 sm:px-6 py-10 sm:py-20 1200:py-35.5 flex flex-col justify-center"
      >
        <div className="inline-flex flex-col mx-auto">
          {/* Row 1 — Little Paws */}
          <div className="flex items-baseline" aria-hidden="true">
            <span className="logo-gradient font-quicksand font-light text-[2.5rem] 620:text-[5rem] 768:text-[7rem] 1000:text-[9rem] 1200:text-[12rem] tracking-tight">
              Little
            </span>
            <span className="logo-gradient font-quicksand font-black text-[5rem] 620:text-[9rem] 768:text-[13rem] 1000:text-[16rem] 1200:text-[19rem] tracking-tighter pr-4">
              Paws
            </span>
          </div>

          {/* Row 2 — right-aligned to Paws */}
          <div className="flex justify-end" aria-hidden="true">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="logo-gradient font-nunito font-bold 968:font-normal text-[1rem] 620:text-[1.5rem] 768:text-[2rem] 968:text-[2.5rem] 1000:text-[3rem] 1150:text-[rem] mr-4 -mt-7 620:-mt-12 768:-mt-18 968:-mt-20 1000:-mt-22 1150:-mt-26 whitespace-nowrap"
            >
              Dachshund Rescue
            </motion.span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
