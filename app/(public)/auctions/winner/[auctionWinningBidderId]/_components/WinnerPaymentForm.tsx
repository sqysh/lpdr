'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { IPaymentMethod } from 'types/_payment-method.types'
import { IAuctionWinningBidder } from 'types/_auction-winning-bidder'
import { fadeUp } from 'lib/constants/motion.constants'
import { FormError, SubmitButton, Toggle } from 'components/_primitives'
import { AuctionWinnerAddressSection } from './AuctionWinnerAddressSection'
import { SavedCardSelector } from 'components/features/payment/SavedCardSelector'
import { CoverFeesToggle } from 'components/features/payment/CoverFeesToggle'
import { CardElementField } from 'components/features/payment/CardElementField'

export type PaymentState = {
  selectedCardId: string | null
  useNewCard: boolean
  loading: boolean
  error: string | null
  saveCard: boolean
  coverFees: boolean
  processingFee: number
  finalAmount: number
  isValid: boolean
}

export type PaymentHandlers = {
  onSelectCard: (id: string) => void
  onUseNewCard: () => void
  onUseSavedCard: () => void
  onCardChange: (state: { complete: boolean; error: string | null }) => void
  onSaveCardToggle: () => void
  onCoverFeesChange: (value: boolean) => void
  onSubmit: (e: { preventDefault: () => void }) => void
}

type Props = {
  winningBidder: IAuctionWinningBidder
  savedCards: IPaymentMethod[]
  state: PaymentState
  handlers: PaymentHandlers
}

export function WinnerPaymentForm({ winningBidder, savedCards, state, handlers }: Props) {
  const session = useSession()
  const {
    selectedCardId,
    useNewCard,
    loading,
    error,
    saveCard,
    coverFees,
    processingFee,
    finalAmount,
    isValid
  } = state
  const {
    onSelectCard,
    onUseNewCard,
    onUseSavedCard,
    onCardChange,
    onSaveCardToggle,
    onCoverFeesChange,
    onSubmit
  } = handlers

  return (
    <div className="space-y-5">
      {/* ── Saved cards ── */}
      {session?.data?.user && savedCards.length > 0 && (
        <SavedCardSelector
          savedCards={savedCards}
          selectedCardId={selectedCardId}
          useNewCard={useNewCard}
          onSelectCard={onSelectCard}
          onUseNewCard={onUseNewCard}
          onUseSavedCard={onUseSavedCard}
        />
      )}

      {/* ── Card element ── */}
      {(!session?.data?.user || savedCards.length === 0 || useNewCard) && (
        <AnimatePresence>
          <motion.div
            key="card-form"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={2}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-px bg-cyan-600 dark:bg-violet-400" aria-hidden="true" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 dark:text-muted-dark">
                Card Details
              </span>
            </div>
            <CardElementField onChange={onCardChange} />
            <div className="flex items-center gap-2 mt-2">
              <ShieldCheck
                className="w-3 h-3 text-zinc-400 dark:text-muted-dark/50 shrink-0"
                aria-hidden="true"
              />
              <p className="font-lato text-[10px] text-zinc-400 dark:text-muted-dark/50">
                Secured and encrypted by Stripe
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Address ── */}
      <AuctionWinnerAddressSection address={winningBidder.user?.address} />

      {/* ── Options ── */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-px bg-cyan-600 dark:bg-violet-400" aria-hidden="true" />
          <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 dark:text-muted-dark">
            Options
          </span>
        </div>
        <div className="border border-zinc-200 dark:border-border-dark divide-y divide-zinc-200 dark:divide-border-dark">
          <CoverFeesToggle
            checked={coverFees}
            onChange={onCoverFeesChange}
            processingFee={processingFee}
          />
          {session?.data?.user && (!selectedCardId || useNewCard) && (
            <Toggle
              id="save-card"
              label="Save card"
              description="One-click checkout next time"
              checked={saveCard}
              onToggle={onSaveCardToggle}
            />
          )}
        </div>
      </motion.div>

      {/* ── Error ── */}
      <FormError error={error} />

      {/* ── Submit ── */}
      <SubmitButton
        loading={loading}
        isValid={isValid}
        label="Complete Payment"
        price={`$${finalAmount.toFixed(2)}`}
        onClick={onSubmit}
      />
    </div>
  )
}
