import { Toggle } from 'components/_primitives'
import { TERMS_AND_CONDITIONS } from 'lib/constants/adoption-application.constants'
import { slideVariants } from 'lib/constants/motion.constants'
import { motion } from 'framer-motion'

export function Step1Terms({ agreedToTerms, handleContinueToInfo, setAgreedToTerms }) {
  return (
    <motion.section
      key="terms"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      aria-labelledby="step-terms-heading"
      className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-6 sm:p-8"
    >
      <h2
        id="step-terms-heading"
        className="font-quicksand text-2xl font-bold text-text-light dark:text-text-dark mb-6"
      >
        Terms &amp; Conditions
      </h2>

      <div
        className="space-y-6 mb-8 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border-light dark:scrollbar-thumb-border-dark"
        tabIndex={0}
        aria-label="Terms and conditions — scrollable"
        role="region"
      >
        {TERMS_AND_CONDITIONS.map((section, index) => (
          <div key={index}>
            <h3 className="text-xs font-mono tracking-widest uppercase text-primary-light dark:text-primary-dark mb-3">
              {section.title}
            </h3>
            <ul className="space-y-2" role="list">
              {section.content.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm text-muted-light dark:text-on-dark"
                >
                  <span
                    className="w-1.5 h-1.5  bg-primary-light dark:bg-primary-dark shrink-0 mt-1.5"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border-light dark:border-border-dark pt-6 space-y-6">
        <Toggle
          id="agree-to-terms"
          label="I have read and agree to the terms and conditions."
          description="I understand that the $15 application fee is non-refundable and that approval is not guaranteed."
          checked={agreedToTerms}
          onToggle={() => setAgreedToTerms((prev) => !prev)}
        />
        <button
          onClick={handleContinueToInfo}
          disabled={!agreedToTerms}
          aria-disabled={!agreedToTerms}
          className="w-full bg-button-light dark:bg-button-dark hover:bg-primary-light dark:hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 px-6 transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          Continue to Info
        </button>
      </div>
    </motion.section>
  )
}
