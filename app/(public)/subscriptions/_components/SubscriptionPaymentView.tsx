import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { T } from 'lib/constants/subscriptions.constants'
import { StepIndicator } from 'components/features/payment/StepIndicator'
import { SignedInRow } from 'components/features/payment/SignedInRow'
import { StepSignIn } from 'components/features/payment/SignInStep'
import { PlanSummary } from './PlanSummary'
import { SubscriptionPaymentForm } from './SubscriptionsPaymentForm'

const paymentStepLabels = ['Choose Plan', 'Sign-In', 'Payment']

export function SubscriptionPaymentView({
  setView,
  selectedTier,
  billing,
  savedPaymentMethods,
  userName
}) {
  const session = useSession()
  const isAuthed = session.status === 'authenticated'
  const currentStep = isAuthed ? 3 : 2

  return (
    <motion.div
      key="payment"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen"
    >
      {/* ── Thin header ── */}
      <div className="border-b border-border-dark px-6 sm:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="block w-5 h-px bg-primary-dark" aria-hidden="true" />
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-dark">
            Little Paws Dachshund Rescue
          </p>
        </div>
        <button
          type="button"
          onClick={() => setView('select')}
          className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase text-muted-dark hover:text-primary-dark transition-colors focus:outline-none focus-visible:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          Change plan
        </button>
      </div>

      {/* Two-col layout — summary left, form right */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] min-h-screen">
        {/* ── Left — plan summary ── */}
        <PlanSummary T={T} billing={billing} selectedTier={selectedTier} setView={setView} />

        {/* ── Right — form ── */}
        <div className="px-6 sm:px-10 pt-12 sm:pt-16 pb-24">
          <div className="max-w-md w-full mx-auto lg:mx-0">
            <StepIndicator current={currentStep} total={3} labels={paymentStepLabels} isDark />

            <SignedInRow isDark />

            {currentStep === 2 && (
              <StepSignIn
                redirectTo={`/subscriptions?tier=${selectedTier.id}&billing=${billing}&view=payment`}
                isDark
              />
            )}

            {currentStep === 3 && (
              <div className="mt-8">
                <SubscriptionPaymentForm
                  tier={selectedTier!}
                  billing={billing}
                  savedCards={savedPaymentMethods}
                  isAuthed={isAuthed}
                  userId={session.data.user.id}
                  firstName={userName.firstName}
                  lastName={userName.lastName}
                  email={session.data.user.email}
                  isDark
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
