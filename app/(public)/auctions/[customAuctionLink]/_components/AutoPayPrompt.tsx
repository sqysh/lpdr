'use client'

import { useState } from 'react'
import { CheckCircle, CreditCard, Loader2, MapPin, X, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { usePaymentMethodModal } from 'stores/payment-method-modal.store'
import AddPaymentMethodModal from 'components/features/payment/AddPaymentMethodModal'
import { UpdateAddressModal } from 'components/_common/UpdateAddressModal'
import { toggleAutoPay } from 'lib/actions/user/auction/toggleAutoPay'

export type AutoPayStatus = { enabled: boolean; hasCard: boolean; hasAddress: boolean }

type Props = { autoPay: AutoPayStatus | null; isEnded: boolean }

type Step = 'card' | 'address' | 'enable'

// Auto-pay needs a saved card and a shipping address before it can be switched on, so the prompt asks for
// whichever is missing first, the same order My Pack enforces. Each step's modal refreshes the page when
// it saves, which moves the prompt on to the next step
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

export function AutoPayPrompt({ autoPay, isEnded }: Props) {
  const router = useRouter()
  const openCardModal = usePaymentMethodModal((s) => s.open)
  const [addressOpen, setAddressOpen] = useState(false)
  const [enabling, setEnabling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Kept after the refresh reports auto-pay on, so the confirmation shows for a moment instead of the prompt vanishing
  const [justEnabled, setJustEnabled] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (!autoPay || isEnded || dismissed) return null
  if (autoPay.enabled && !justEnabled) return null

  const step = stepFor(autoPay)
  const { icon: Icon, title, body, cta } = STEPS[step]

  const onAction = async () => {
    setError(null)
    if (step === 'card') return openCardModal()
    if (step === 'address') return setAddressOpen(true)

    // toggleAutoPay flips the setting, so it's only ever called from here while it's off
    setEnabling(true)
    const result = await toggleAutoPay()
    setEnabling(false)

    if (!result.success) {
      setError(result.error ?? "Auto-pay couldn't be turned on. Please try again.")
      return
    }

    setJustEnabled(true)
    router.refresh()
  }

  return (
    <>
      <aside
        aria-labelledby="autopay-prompt-title"
        className="relative mb-8 flex items-start gap-3 p-4 pr-12 border border-primary-light/30 dark:border-primary-dark/30 bg-primary-light/5 dark:bg-primary-dark/5"
      >
        {justEnabled ? (
          <p role="status" className="flex items-center gap-3 text-sm text-text-light dark:text-text-dark">
            <CheckCircle size={18} className="shrink-0 text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
            <span>
              <strong>Auto-pay is on.</strong> If you win, your card will be charged automatically. You can turn it off in My Pack.
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
              <h2 id="autopay-prompt-title" className="font-quicksand font-black text-base text-text-light dark:text-text-dark">
                {title}
              </h2>
              <p className="text-sm text-muted-light dark:text-muted-dark leading-relaxed">{body}</p>
              <button
                type="button"
                onClick={onAction}
                disabled={enabling}
                className="inline-flex items-center gap-2 min-h-10 px-4 bg-primary-light dark:bg-primary-dark text-white text-[11px] font-mono tracking-tag uppercase font-black hover:bg-secondary-light dark:hover:bg-secondary-dark disabled:opacity-60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                {enabling && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
                {enabling ? 'Turning on' : cta}
              </button>
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
          aria-label={justEnabled ? 'Close' : 'Dismiss auto-pay tip'}
          className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </aside>

      <AddPaymentMethodModal />
      {/* Only shown when there's no address yet, so it always starts empty */}
      <UpdateAddressModal open={addressOpen} onClose={() => setAddressOpen(false)} address={null} />
    </>
  )
}
