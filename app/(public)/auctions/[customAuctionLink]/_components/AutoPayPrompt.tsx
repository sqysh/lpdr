'use client'

import { useState } from 'react'
import { CheckCircle, CreditCard, HeartHandshake, Link, Loader2, MapPin, X, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { usePaymentMethodModal } from 'stores/payment-method-modal.store'
import AddPaymentMethodModal from 'components/features/payment/AddPaymentMethodModal'
import { UpdateAddressModal } from 'components/_common/UpdateAddressModal'
import { toggleAutoPay } from 'lib/actions/user/auction/toggleAutoPay'
import { toggleAutoPayCoverFees } from 'lib/actions/user/auction/toggleAutoPayCoverFees'

export type AutoPayStatus = { enabled: boolean; coversFees: boolean; hasCard: boolean; hasAddress: boolean }

type Props = { autoPay: AutoPayStatus | null; isEnded: boolean }

type Step = 'card' | 'address' | 'enable'

// Where the prompt is in its flow. The fee question only follows turning auto-pay on here, so people
// who said no aren't asked again on every visit
type Phase = 'setup' | 'fees' | 'done'

const STEPS: Record<Step, { icon: typeof Zap; title: string; body: string; cta: string }> = {
  card: {
    icon: CreditCard,
    title: 'Save a card to skip checkout if you win',
    body: "With a saved card, a shipping address and auto-pay on, we'll charge you automatically if you win and your item ships sooner.",
    cta: 'Save a card'
  },
  address: {
    icon: MapPin,
    title: 'Add a shipping address for auto-pay',
    body: 'Your card is saved. Add where to ship, then turn on auto-pay, and wins are charged automatically with no checkout.',
    cta: 'Add an address'
  },
  enable: {
    icon: Zap,
    title: 'Turn on auto-pay',
    body: "Your card and address are saved. If you win, we'll charge your card automatically and your item ships sooner.",
    cta: 'Turn on auto-pay'
  }
}

const stepFor = ({ hasCard, hasAddress }: AutoPayStatus): Step => (!hasCard ? 'card' : !hasAddress ? 'address' : 'enable')

const BUTTON =
  'inline-flex items-center gap-2 min-h-10 px-4 text-[11px] font-mono tracking-tag uppercase font-black disabled:opacity-60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark'
const PRIMARY = `${BUTTON} bg-primary-light dark:bg-primary-dark text-white hover:bg-secondary-light dark:hover:bg-secondary-dark`
const SECONDARY = `${BUTTON} border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark`

export function AutoPayPrompt({ autoPay, isEnded }: Props) {
  const router = useRouter()
  const openCardModal = usePaymentMethodModal((s) => s.open)
  const [phase, setPhase] = useState<Phase>('setup')
  const [addressOpen, setAddressOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)

  if (!autoPay || isEnded || dismissed) return null
  // Already set up before this visit: a quiet summary instead of the prompt, so the settings stay discoverable
  if (autoPay.enabled && phase === 'setup') {
    return (
      <p className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-muted-light dark:text-muted-dark">
        <span className="inline-flex items-center gap-1.5">
          <Zap size={12} className="text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
          Auto-pay is on
        </span>
        <span aria-hidden="true">·</span>
        <span>{autoPay.coversFees ? 'Covering the card fee' : 'Not covering the card fee'}</span>
        <Link href="/my-pack?tab=settings" className="text-primary-light dark:text-primary-dark hover:underline underline-offset-4">
          Change
        </Link>
      </p>
    )
  }

  const onSetupAction = async () => {
    setError(null)
    const step = stepFor(autoPay)
    if (step === 'card') return openCardModal()
    if (step === 'address') return setAddressOpen(true)

    // toggleAutoPay flips the setting, so it's only called from here while it's off
    setBusy(true)
    const result = await toggleAutoPay()
    setBusy(false)

    if (!result.success) {
      setError(result.error ?? "Auto-pay couldn't be turned on. Please try again.")
      return
    }

    // Someone who already covers fees has nothing more to decide
    setPhase(autoPay.coversFees ? 'done' : 'fees')
    router.refresh()
  }

  const onCoverFees = async () => {
    setError(null)
    setBusy(true)
    // Also a toggle, and fees are known to be off here, since that's the only way to reach this phase
    const result = await toggleAutoPayCoverFees()
    setBusy(false)

    if (!result.success) {
      setError(result.error ?? "That couldn't be saved. Please try again.")
      return
    }

    setPhase('done')
    router.refresh()
  }

  const step = STEPS[stepFor(autoPay)]
  const Icon = phase === 'fees' ? HeartHandshake : step.icon

  return (
    <>
      <aside
        aria-labelledby="autopay-prompt-title"
        className="relative mb-8 flex items-start gap-3 p-4 pr-12 border border-primary-light/30 dark:border-primary-dark/30 bg-primary-light/5 dark:bg-primary-dark/5"
      >
        {phase === 'done' ? (
          <p role="status" className="flex items-center gap-3 text-sm text-text-light dark:text-text-dark">
            <CheckCircle size={18} className="shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
            <span>
              <strong>You&apos;re all set.</strong> If you win, your card will be charged automatically. You can change this anytime in My
              Pack.
            </span>
          </p>
        ) : (
          <>
            <div
              className="shrink-0 w-9 h-9 flex items-center justify-center bg-primary-light/10 dark:bg-primary-dark/10"
              aria-hidden="true"
            >
              <Icon size={16} className="text-primary-light dark:text-primary-dark" />
            </div>

            <div className="min-w-0 space-y-2">
              {phase === 'fees' ? (
                <>
                  <h2 id="autopay-prompt-title" className="font-quicksand font-black text-base text-text-light dark:text-text-dark">
                    Auto-pay is on. Cover the card fee too?
                  </h2>
                  <p className="text-sm text-muted-light dark:text-muted-dark leading-relaxed">
                    When your win is charged, we can add the card processing fee so the rescue receives your full winning bid.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={onCoverFees} disabled={busy} className={PRIMARY}>
                      {busy && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
                      Yes, cover the fee
                    </button>
                    <button type="button" onClick={() => setPhase('done')} disabled={busy} className={SECONDARY}>
                      No thanks
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 id="autopay-prompt-title" className="font-quicksand font-black text-base text-text-light dark:text-text-dark">
                    {step.title}
                  </h2>
                  <p className="text-sm text-muted-light dark:text-muted-dark leading-relaxed">{step.body}</p>
                  <button type="button" onClick={onSetupAction} disabled={busy} className={PRIMARY}>
                    {busy && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
                    {busy ? 'Turning on' : step.cta}
                  </button>
                </>
              )}

              {error && (
                <p role="alert" className="text-[13px] text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>
          </>
        )}

        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label={phase === 'done' ? 'Close' : 'Dismiss auto-pay tip'}
          className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </aside>

      <AddPaymentMethodModal />
      <UpdateAddressModal open={addressOpen} onClose={() => setAddressOpen(false)} address={null} />
    </>
  )
}
