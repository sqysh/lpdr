'use client'

import { SyntheticEvent } from 'react'
import { motion } from 'framer-motion'
import { IPaymentMethod } from 'types/payment-method.types'
import { fadeUp } from 'lib/constants/motion.constants'
import { AuctionWinnerReceipt, WinnerOrderSummary } from './_components'
import { AuctionWinnerPaymentForm } from './_components/AuctionWinnerPaymentForm'
import { calculateStripeFees } from 'lib/utils/fees.utils'
import { useStripeCheckout } from '@hooks/useStripeCheckout.hook'
import { PaymentHandlers, PaymentState } from './_types/auction-winner.types'
import { IAuctionWinningBidder } from 'types/auction.types'
import { AuctionWinnerPageHeader } from './_components/AuctionWinnerPageHeader'
import { useRefreshOnSignOut } from '@hooks/useRefreshOnSignOut.hook'

const EYEBROW = 'text-f10 uppercase tracking-[0.25em]'

interface Props {
  winningBidder: IAuctionWinningBidder
  savedCards: IPaymentMethod[]
  userId: string
  userEmail: string | null
  isAuthed: boolean
}

export default function AuctionWinnerPaymentClient({ winningBidder, savedCards, userId, userEmail, isAuthed }: Props) {
  const { user, auction, auctionItems } = winningBidder
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')

  const { payment, patch, usingSavedCard, pay } = useStripeCheckout({
    savedCards,
    userId,
    isAuthed: true,
    billingName: fullName,
    billingEmail: userEmail ?? user.email ?? ''
  })

  useRefreshOnSignOut(isAuthed)

  const alreadyPaid = winningBidder.winningBidPaymentStatus === 'PAID'

  // Read the stored totals rather than re-adding the items. createPaymentIntent prices this
  // payment from the same winner row, so deriving it here is a second source of truth that can
  // disagree with what the card is actually charged.
  const itemsTotal = Number(winningBidder.itemsTotal ?? 0)
  const shipping = Number(winningBidder.shipping ?? 0)
  const subtotal = itemsTotal + shipping

  const processingFee = calculateStripeFees(subtotal)
  const finalAmount = payment.coverFees ? subtotal + processingFee : subtotal
  const isValid = usingSavedCard ? true : payment.cardComplete

  const itemCount = auctionItems.length

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
        <AuctionWinnerPageHeader auctionTitle={auction.title} itemCount={itemCount} userFirstName={user.firstName} />

        {/* ── Paying as ── */}
        {fullName && (
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0.5} className="mb-6">
            <div className="border-l-2 border-cyan-600 dark:border-violet-400 pl-4">
              <p className={`${EYEBROW} text-zinc-500 dark:text-muted-dark mb-0.5`}>Paying as</p>
              <p className="text-lg uppercase leading-none text-zinc-950 dark:text-text-dark">{fullName}</p>
              <p className="font-lato text-xs text-zinc-400 dark:text-muted-dark/50 mt-0.5">{userEmail ?? user.email}</p>
            </div>
          </motion.div>
        )}

        {/* ── Two column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
          <AuctionWinnerPaymentForm winningBidder={winningBidder} savedCards={savedCards} state={state} handlers={handlers} isAuthed />

          <WinnerOrderSummary
            winningBidder={winningBidder}
            total={itemsTotal}
            shipping={shipping}
            processingFee={processingFee}
            finalAmount={finalAmount}
            coverFees={payment.coverFees}
          />
        </div>
      </div>
    </div>
  )
}
