import { slideVariants } from 'app/lib/constants/motion.constants'
import { motion } from 'framer-motion'
import { Step3PaymentForm } from './Step3PaymentForm'

export function Step3Payment({ savedCards, setStep, email, firstName, lastName, isAuthed }) {
  return (
    <motion.section
      key="payment"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      aria-labelledby="step-payment-heading"
      className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-6 sm:p-8"
    >
      <h2
        id="step-payment-heading"
        className="font-quicksand text-2xl font-bold text-text-light dark:text-text-dark mb-1"
      >
        Payment
      </h2>
      <p className="text-sm text-muted-light dark:text-on-dark mb-6">
        Complete your $15 application fee to submit your adoption application.
      </p>

      <div className="bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark p-4 mb-6 flex items-center justify-between">
        <span className="text-sm font-medium text-text-light dark:text-text-dark">
          Application Fee
        </span>
        <span className="font-quicksand text-2xl font-bold text-text-light dark:text-text-dark">
          $15.00
        </span>
      </div>

      <Step3PaymentForm
        savedCards={savedCards}
        email={email}
        firstName={firstName}
        isAuthed={isAuthed}
        lastName={lastName}
      />

      <button
        onClick={() => setStep('info')}
        className="w-full mt-4 text-xs font-mono text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
      >
        ← Back to Info
      </button>
    </motion.section>
  )
}
