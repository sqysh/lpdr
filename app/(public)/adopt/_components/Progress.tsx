import { STEP_LABELS, STEPS } from 'lib/constants/adoption-application.constants'
import { motion } from 'framer-motion'

export function Progress({ currentIndex, step }) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      aria-label="Application steps"
      className="mb-10"
    >
      <ol className="flex items-center justify-center gap-0" role="list">
        {STEPS.map((s, index) => {
          const isComplete = index < currentIndex
          const isCurrent = s === step

          return (
            <li key={s} className="flex items-center" role="listitem">
              <div className="flex flex-col items-center">
                <div
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={`Step ${index + 1}: ${STEP_LABELS[s]}${isComplete ? ' (complete)' : isCurrent ? ' (current)' : ''}`}
                  className={`w-9 h-9 flex items-center justify-center font-mono text-sm font-bold transition-colors duration-300 ${
                    isComplete
                      ? 'bg-primary-light dark:bg-primary-dark text-white'
                      : isCurrent
                        ? 'bg-button-light dark:bg-button-dark text-white border-2 border-primary-light dark:border-primary-dark'
                        : 'bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark'
                  }`}
                >
                  {isComplete ? (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`mt-1.5 text-[10px] font-mono tracking-widest uppercase ${isCurrent ? 'text-primary-light dark:text-primary-dark' : 'text-muted-light dark:text-muted-dark'}`}
                >
                  {STEP_LABELS[s]}
                </span>
              </div>
              {index < STEPS?.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`w-16 sm:w-24 h-px mx-2 mb-5 transition-colors duration-300 ${
                    index < currentIndex
                      ? 'bg-primary-light dark:bg-primary-dark'
                      : 'bg-border-light dark:bg-border-dark'
                  }`}
                />
              )}
            </li>
          )
        })}
      </ol>
    </motion.nav>
  )
}
