'use client'

import { SyntheticEvent } from 'react'
import { motion } from 'framer-motion'
import { Trophy, User } from 'lucide-react'
import Link from 'next/link'
import { IAuctionWinningBidder } from 'types/auction-winning-bidder'
import { IPaymentMethod } from 'types/payment-method.types'
import { fadeUp } from 'lib/constants/motion.constants'
import { AuctionWinnerReceipt, WinnerOrderSummary } from './_components'
import { AuctionWinnerPaymentForm } from './_components/AuctionWinnerPaymentForm'
import { calculateStripeFees } from 'lib/utils/fees.utils'
import { useStripeCheckout } from '@hooks/useStripeCheckout.hook'
import { PaymentHandlers, PaymentState } from './_types/auction-winner.types'

interface Props {
  winningBidder: IAuctionWinningBidder
  savedCards: IPaymentMethod[]
  isAuthed: boolean
  userId: string | null
  userEmail: string | null
}

export default function AuctionWinnerPaymentClient({ winningBidder, savedCards, isAuthed, userId, userEmail }: Props) {
  const { payment, patch, usingSavedCard, pay } = useStripeCheckout({
    savedCards,
    isAuthed,
    userId: userId ?? '',
    billingName: `${winningBidder?.user.firstName} ${winningBidder?.user.lastName}`,
    billingEmail: userEmail ?? ''
  })

  const alreadyPaid = winningBidder?.winningBidPaymentStatus === 'PAID'
  const total = winningBidder.auctionItems.reduce((sum, item) => sum + item.soldPrice, 0)
  const shipping = winningBidder.shipping ?? 0
  const subtotal = total + shipping
  const processingFee = calculateStripeFees(subtotal)
  const finalAmount = payment.coverFees ? subtotal + processingFee : subtotal
  const isValid = usingSavedCard ? true : payment.cardComplete

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()

    pay({
      orderType: 'AUCTION_PURCHASE' as const,
      coverFees: payment.coverFees,
      winningBidderId: winningBidder.id
    })
  }

  const state: PaymentState = {
    selectedCardId: payment.selectedCardId,
    useNewCard: payment.useNewCard,
    loading: payment.loading,
    error: payment.error,
    saveCard: payment.saveCard,
    coverFees: payment.coverFees,
    processingFee,
    finalAmount,
    isValid
  }

  const handlers: PaymentHandlers = {
    onSelectCard: (id) => patch({ selectedCardId: id, useNewCard: false }),
    onUseNewCard: () => patch({ useNewCard: true, selectedCardId: null }),
    onUseSavedCard: () => patch({ useNewCard: false, selectedCardId: savedCards[0]?.stripePaymentId ?? null }),
    onCardChange: ({ complete, error }) => patch({ cardComplete: complete, error }),
    onSaveCardToggle: () => patch({ saveCard: !payment.saveCard }),
    onCoverFeesChange: (coverFees) => patch({ coverFees }),
    onSubmit: handleSubmit
  }

  if (alreadyPaid) return <AuctionWinnerReceipt winningBidder={winningBidder} />

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
                You won {winningBidder?.auctionItems.length === 1 ? 'an item' : `${winningBidder?.auctionItems.length} items`} in
                the auction. Complete your payment below to claim {winningBidder?.auctionItems.length === 1 ? 'it' : 'them'}.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Paying as ── */}
        {winningBidder.user?.firstName && (
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0.5} className="mb-6">
            <div className="border-l-2 border-cyan-600 dark:border-violet-400 pl-4">
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 dark:text-muted-dark mb-0.5">Paying as</p>
              <p className="text-lg uppercase leading-none text-zinc-950 dark:text-text-dark">
                {[winningBidder.user.firstName, winningBidder.user.lastName].filter(Boolean).join(' ')}
              </p>
              <p className="font-lato text-xs text-zinc-400 dark:text-muted-dark/50 mt-0.5">{winningBidder.user.email}</p>
            </div>
          </motion.div>
        )}

        {/* ── Two column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
          <AuctionWinnerPaymentForm
            winningBidder={winningBidder}
            savedCards={savedCards}
            isAuthed={isAuthed}
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
