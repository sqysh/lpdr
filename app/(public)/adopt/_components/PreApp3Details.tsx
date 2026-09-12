import { motion } from 'framer-motion'
import { Info, Loader2 } from 'lucide-react'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { FormField } from 'components/_primitives'
import { slideVariants } from 'lib/constants/motion.constants'
import { STEPS_TYPES } from 'types/adoption-application.types'
import type { RedeemBypassCodeInput } from 'lib/schemas/adoption-fee.schema'

type Props = {
  register: UseFormRegister<RedeemBypassCodeInput>
  errors: FieldErrors<RedeemBypassCodeInput>
  email: string | null
  bypassError: string
  redeeming: boolean
  onRedeemCode: () => void
  onContinueToPayment: () => void
  setStep: (step: STEPS_TYPES) => void
}

const inputClass =
  'flex-1 px-4 py-3 bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark placeholder:text-muted-light dark:placeholder:text-muted-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition w-full'

export function PreApp3Details({
  register,
  errors,
  email,
  bypassError,
  redeeming,
  onRedeemCode,
  onContinueToPayment,
  setStep
}: Props) {
  return (
    <motion.section
      key="details"
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      aria-labelledby="step-details-heading"
      className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-6 sm:p-8"
    >
      {/* ── Your info ── */}
      <h2 id="step-details-heading" className="text-2xl uppercase leading-none text-text-light dark:text-text-dark mb-6">
        Your Information
      </h2>

      <div className="space-y-5">
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
          <FormField
            id="firstName"
            label="First Name"
            {...register('firstName')}
            error={errors.firstName?.message}
            className={inputClass}
            required
            unstyled
          />
          <FormField
            id="lastName"
            label="Last Name"
            {...register('lastName')}
            error={errors.lastName?.message}
            className={inputClass}
            required
            unstyled
          />
        </div>

        <FormField
          id="email"
          name="email"
          label="Email Address"
          type="email"
          value={email ?? ''}
          onChange={() => {}}
          hint="Using your signed-in account email."
          disabled
          readOnly
        />

        {/* ── Fee info box ── */}
        <div
          className="bg-bg-light dark:bg-bg-dark border border-primary-light/30 dark:border-primary-dark/30 p-4"
          role="note"
          aria-label="Application fee information"
        >
          <div className="flex gap-3">
            <Info className="w-4 h-4 text-primary-light dark:text-primary-dark shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-sm">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-text-light dark:text-text-dark">Application Fee:</p>
                <span className="font-semibold text-text-light dark:text-text-dark">$15</span>
              </div>
              <p className="text-muted-light dark:text-on-dark text-xs leading-relaxed">
                This non-refundable fee covers application processing and background checks. The final adoption fee will be
                discussed if your application is approved.
              </p>
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <button
          type="button"
          onClick={onContinueToPayment}
          disabled={redeeming}
          className="w-full bg-button-light dark:bg-button-dark hover:bg-primary-light dark:hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 px-6 transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          Continue to Payment
        </button>
      </div>

      {/* ── Bypass code ── */}
      <div className="border border-border-light dark:border-border-dark p-5 mt-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="block w-4 h-px bg-primary-light dark:bg-primary-dark" aria-hidden="true" />
          <p className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
            Have a Bypass Code?
          </p>
        </div>
        <p className="text-xs text-muted-light dark:text-muted-dark mb-4 leading-relaxed">
          If you have a code to waive the application fee, enter it below. A valid code takes you straight to the application, no
          payment required.
        </p>
        <div className="flex gap-2">
          <input id="bypassCode" type="text" {...register('bypassCode')} placeholder="Enter bypass code" className={inputClass} />
          <button
            type="button"
            onClick={onRedeemCode}
            disabled={redeeming}
            aria-disabled={redeeming}
            className="px-5 py-3 shrink-0 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark hover:border-primary-light dark:hover:border-primary-dark text-text-light dark:text-text-dark disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark flex items-center gap-2"
          >
            {redeeming && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            {redeeming ? 'Checking…' : 'Apply Code'}
          </button>
        </div>

        {(bypassError || errors.bypassCode) && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-xs text-red-500 dark:text-red-400"
            role="alert"
          >
            {bypassError || errors.bypassCode?.message}
          </motion.p>
        )}
      </div>

      <button
        type="button"
        onClick={() => setStep('terms')}
        className="w-full mt-6 text-xs font-mono text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
      >
        ← Back to Terms
      </button>
    </motion.section>
  )
}
