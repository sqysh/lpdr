'use client'

import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Trophy, User } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { IAuctionWinningBidder } from 'types/_auction-winning-bidder'
import { IPaymentMethod } from 'types/_payment-method.types'
import { fadeUp } from 'lib/constants/motion.constants'
import { usePaymentProcessor } from 'lib/hooks/usePaymentProcessor.hook'
import { useDefaultCard } from 'lib/hooks/useDefaultCard.hook'
import { createPaymentIntent } from 'lib/actions/_stripe/createPaymentIntent'
import { AuctionReceipt, WinnerOrderSummary } from './_components'
import { PaymentHandlers, PaymentState, WinnerPaymentForm } from './_components/WinnerPaymentForm'
import { calculateStripeFees } from 'lib/utils/fees.utils'

type WinnerFormInputs = {
  selectedCardId: string | null
  useNewCard: boolean
  cardComplete: boolean
  loading: boolean
  error: string | null
  saveCard: boolean
  coverFees: boolean
}

const EMPTY: WinnerFormInputs = {
  selectedCardId: null,
  useNewCard: false,
  cardComplete: false,
  loading: false,
  error: null,
  saveCard: false,
  coverFees: true
}

interface Props {
  winningBidder: IAuctionWinningBidder
  savedCards: IPaymentMethod[]
}

export default function AuctionWinnerPaymentClient({ winningBidder, savedCards }: Props) {
  const stripe = useStripe()
  const elements = useElements()
  const session = useSession()
  const { setupPusherListenerOneTime } = usePaymentProcessor()

  const [inputs, setInputs] = useState<WinnerFormInputs>({
    ...EMPTY,
    selectedCardId: savedCards?.[0]?.stripePaymentId ?? null,
    useNewCard: savedCards?.length === 0
  })
  const patch = (data: Partial<WinnerFormInputs>) => setInputs((prev) => ({ ...prev, ...data }))

  const alreadyPaid = winningBidder?.winningBidPaymentStatus === 'PAID'
  const total = winningBidder.auctionItems.reduce((sum, item) => sum + item.soldPrice, 0)
  const shipping = winningBidder.shipping ?? 0
  const subtotal = total + shipping
  const processingFee = calculateStripeFees(subtotal)
  const finalAmount = inputs.coverFees ? subtotal + processingFee : subtotal
  const usingSavedCard = !!inputs.selectedCardId && !inputs.useNewCard && !!session.data?.user
  const isValid = usingSavedCard ? true : inputs.cardComplete

  const name = `${winningBidder?.user.firstName} ${winningBidder?.user.lastName}`
  const email = session.data?.user?.email

  const setDefaultCard = useCallback((value: string) => patch({ selectedCardId: value }), [])
  useDefaultCard(savedCards, setDefaultCard)

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault()
    if (!stripe || !elements) return
    patch({ loading: true, error: null })

    try {
      const basePayload = {
        orderType: 'AUCTION_PURCHASE' as const,
        coverFees: inputs.coverFees,
        winningBidderId: winningBidder.id
      }

      if (usingSavedCard) {
        const result = await createPaymentIntent({
          ...basePayload,
          savedCardId: inputs.selectedCardId
        })
        if (!result.success) throw new Error(result.error)
        setupPusherListenerOneTime()
      } else {
        const cardElement = elements.getElement(CardElement)
        if (!cardElement) throw new Error('Card element not found')

        const intentResult = await createPaymentIntent({
          ...basePayload,
          saveCard: inputs.saveCard
        })
        if (!intentResult.success) throw new Error(intentResult.error)

        const result = await stripe.confirmCardPayment(intentResult.data.clientSecret!, {
          payment_method: { card: cardElement, billing_details: { name, email } }
        })

        if (result.error) {
          patch({ loading: false, error: result.error.message ?? 'Payment failed' })
        } else if (result.paymentIntent?.status === 'succeeded') {
          setupPusherListenerOneTime()
        }
      }
    } catch (err) {
      patch({
        loading: false,
        error: err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      })
    }
  }

  if (alreadyPaid) return <AuctionReceipt winningBidder={winningBidder} />

  const state: PaymentState = {
    selectedCardId: inputs.selectedCardId,
    useNewCard: inputs.useNewCard,
    loading: inputs.loading,
    error: inputs.error,
    saveCard: inputs.saveCard,
    coverFees: inputs.coverFees,
    processingFee,
    finalAmount,
    isValid
  }

  const handlers: PaymentHandlers = {
    onSelectCard: (id) => patch({ selectedCardId: id }),
    onUseNewCard: () => patch({ useNewCard: true, selectedCardId: null }),
    onUseSavedCard: () =>
      patch({ useNewCard: false, selectedCardId: savedCards[0]?.stripePaymentId ?? null }),
    onCardChange: ({ complete, error }) => patch({ cardComplete: complete, error }),
    onSaveCardToggle: () => patch({ saveCard: !inputs.saveCard }),
    onCoverFeesChange: (coverFees) => patch({ coverFees }),
    onSubmit: handleSubmit
  }

  return (
    <div className="min-h-dvh bg-white dark:bg-bg-dark">
      <div className="max-w-4xl mx-auto px-4 430:px-6 py-12 430:py-16">
        {/* ── Page header ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-px bg-cyan-600 dark:bg-violet-400" aria-hidden="true" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-cyan-600 dark:text-violet-400">
                {winningBidder?.auction.title}
              </span>
            </div>
            <Link
              href="/my-pack"
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-zinc-400 dark:text-muted-dark hover:text-cyan-600 dark:hover:text-violet-400 transition-colors"
            >
              <User className="w-3 h-3" aria-hidden="true" />
              My Pack
            </Link>
          </div>
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 flex items-center justify-center bg-cyan-600/10 dark:bg-violet-400/10">
              <Trophy className="w-5 h-5 text-cyan-600 dark:text-violet-400" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-3xl 430:text-4xl uppercase leading-none text-zinc-950 dark:text-text-dark mb-2">
                Congratulations, {winningBidder?.user?.firstName}!
              </h1>
              <p className="font-lato text-sm text-zinc-500 dark:text-muted-dark leading-relaxed max-w-lg">
                You won{' '}
                {winningBidder?.auctionItems.length === 1
                  ? 'an item'
                  : `${winningBidder?.auctionItems.length} items`}{' '}
                in the auction. Complete your payment below to claim{' '}
                {winningBidder?.auctionItems.length === 1 ? 'it' : 'them'}.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Paying as ── */}
        {winningBidder.user?.firstName && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.5}
            className="mb-6"
          >
            <div className="border-l-2 border-cyan-600 dark:border-violet-400 pl-4">
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 dark:text-muted-dark mb-0.5">
                Paying as
              </p>
              <p className="text-lg uppercase leading-none text-zinc-950 dark:text-text-dark">
                {[winningBidder.user.firstName, winningBidder.user.lastName]
                  .filter(Boolean)
                  .join(' ')}
              </p>
              <p className="font-lato text-xs text-zinc-400 dark:text-muted-dark/50 mt-0.5">
                {winningBidder.user.email}
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Two column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
          <WinnerPaymentForm
            winningBidder={winningBidder}
            savedCards={savedCards}
            state={state}
            handlers={handlers}
          />
          <WinnerOrderSummary
            winningBidder={winningBidder}
            total={total}
            shipping={shipping}
            processingFee={processingFee}
            finalAmount={finalAmount}
          />
        </div>
      </div>
    </div>
  )
}
