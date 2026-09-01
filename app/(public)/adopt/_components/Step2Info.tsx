import { motion } from 'framer-motion'
import { CheckCircle, Info, Loader2 } from 'lucide-react'
import { FormField } from 'components/_primitives'
import { slideVariants } from 'lib/constants/motion.constants'
import { STEPS_TYPES } from 'types/_adoption-application.types'

type Inputs = {
  bypassCode: string
  firstName: string
  lastName: string
  email: string
}

type Props = {
  inputs: Inputs
  setInputs: React.Dispatch<React.SetStateAction<Inputs>>
  verifyingCode: boolean
  bypassError: string
  bypassPayment: boolean
  setBypassPayment: (v: boolean) => void
  setBypassError: (v: string) => void
  handleVerifyBypassCode: () => void
  isProceeding: boolean
  handleProceed: () => void
  setStep: (step: STEPS_TYPES) => void
}

export function Step2Info({
  inputs,
  setInputs,
  verifyingCode,
  bypassError,
  bypassPayment,
  setBypassPayment,
  setBypassError,
  handleVerifyBypassCode,
  isProceeding,
  handleProceed,
  setStep
}: Props) {
  const patch = (data: Partial<Inputs>) => setInputs((prev) => ({ ...prev, ...data }))

  return (
    <motion.section
      key="info"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      aria-labelledby="step-info-heading"
      className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-6 sm:p-8"
    >
      {/* ── Bypass code ── */}
      <div className="border border-border-light dark:border-border-dark p-5 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span
            className="block w-4 h-px bg-primary-light dark:bg-primary-dark"
            aria-hidden="true"
          />
          <p className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
            Have a Bypass Code?
          </p>
        </div>
        <p className="text-xs text-muted-light dark:text-muted-dark mb-4 leading-relaxed">
          If you have a code to waive the application fee, enter it below and verify. A successful
          verification will take you directly to the application — no payment required.
        </p>
        <div className="flex gap-2">
          <input
            id="bypassCode"
            type="text"
            value={inputs.bypassCode}
            onChange={(e) => {
              patch({ bypassCode: e.target.value })
              setBypassPayment(false)
              setBypassError('')
            }}
            placeholder="Enter bypass code"
            className="flex-1 px-4 py-3 bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark placeholder:text-muted-light dark:placeholder:text-muted-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition"
          />
          <button
            type="button"
            onClick={handleVerifyBypassCode}
            disabled={!inputs.bypassCode.trim() || verifyingCode}
            aria-disabled={!inputs.bypassCode.trim() || verifyingCode}
            className="px-5 py-3 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark hover:border-primary-light dark:hover:border-primary-dark text-text-light dark:text-text-dark disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            {verifyingCode ? 'Verifying…' : 'Verify'}
          </button>
        </div>

        {bypassError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-xs text-secondary-light dark:text-secondary-dark"
            role="alert"
          >
            {bypassError}
          </motion.p>
        )}
        {bypassPayment && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-2 text-xs text-primary-light dark:text-primary-dark"
            role="status"
          >
            <CheckCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            Valid code — application fee waived. Fill in your details below to continue.
          </motion.p>
        )}
      </div>

      {/* ── Your info ── */}
      <h2
        id="step-info-heading"
        className="text-2xl uppercase leading-none text-text-light dark:text-text-dark mb-6"
      >
        Your Information
      </h2>

      <div className="space-y-5">
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
          <FormField
            id="firstName"
            name="firstName"
            label="First Name"
            value={inputs.firstName}
            onChange={(e) => patch({ firstName: e.target.value })}
            className="flex-1 px-4 py-3 bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark placeholder:text-muted-light dark:placeholder:text-muted-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition w-full"
            required
            unstyled
          />
          <FormField
            id="lastName"
            name="lastName"
            label="Last Name"
            value={inputs.lastName}
            onChange={(e) => patch({ lastName: e.target.value })}
            className="flex-1 px-4 py-3 bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark placeholder:text-muted-light dark:placeholder:text-muted-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition w-full"
            required
            unstyled
          />
        </div>
        <FormField
          id="email"
          name="email"
          label="Email Address"
          type="email"
          value={inputs.email}
          onChange={(e) => patch({ email: e.target.value })}
          required
          disabled
        />

        {/* ── Fee info box ── */}
        <div
          className={`bg-bg-light dark:bg-bg-dark border p-4 transition-colors ${
            bypassPayment
              ? 'border-primary-light/50 dark:border-primary-dark/50'
              : 'border-primary-light/30 dark:border-primary-dark/30'
          }`}
          role="note"
          aria-label="Application fee information"
        >
          <div className="flex gap-3">
            {bypassPayment ? (
              <CheckCircle
                className="w-4 h-4 text-primary-light dark:text-primary-dark shrink-0 mt-0.5"
                aria-hidden="true"
              />
            ) : (
              <Info
                className="w-4 h-4 text-primary-light dark:text-primary-dark shrink-0 mt-0.5"
                aria-hidden="true"
              />
            )}
            <div className="text-sm">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-text-light dark:text-text-dark">
                  Application Fee:
                </p>
                {bypassPayment ? (
                  <div className="flex items-center gap-1.5">
                    <span className="line-through text-muted-light dark:text-muted-dark text-xs">
                      $15
                    </span>
                    <span className="font-semibold text-primary-light dark:text-primary-dark">
                      $0
                    </span>
                  </div>
                ) : (
                  <span className="font-semibold text-text-light dark:text-text-dark">$15</span>
                )}
              </div>
              <p className="text-muted-light dark:text-on-dark text-xs leading-relaxed">
                {bypassPayment
                  ? 'Your bypass code has been verified — the application fee has been waived.'
                  : 'This non-refundable fee covers application processing and background checks. The final adoption fee will be discussed if your application is approved.'}
              </p>
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <button
          onClick={handleProceed}
          disabled={!inputs.firstName || !inputs.lastName || !inputs.email || isProceeding}
          aria-disabled={!inputs.firstName || !inputs.lastName || !inputs.email || isProceeding}
          className="w-full bg-button-light dark:bg-button-dark hover:bg-primary-light dark:hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 px-6 transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark flex items-center justify-center gap-2"
        >
          {isProceeding ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Please wait…</span>
              <span className="sr-only">Processing, please wait</span>
            </>
          ) : bypassPayment ? (
            'Continue to Application'
          ) : (
            'Continue to Payment'
          )}
        </button>

        <button
          onClick={() => setStep('terms')}
          className="w-full text-xs font-mono text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          ← Back to Terms
        </button>
      </div>
    </motion.section>
  )
}
