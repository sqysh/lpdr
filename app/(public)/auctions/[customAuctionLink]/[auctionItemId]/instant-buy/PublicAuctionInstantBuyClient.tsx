'use client'

import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { createPaymentIntent } from 'lib/actions/_stripe/createPaymentIntent'
import { updateAddress } from 'lib/actions/my-pack/updateAddress'
import { CardElementField } from 'components/features/payment/CardElementField'
import { FormError } from 'components/_primitives/FormError'
import { SubmitButton } from 'components/_primitives/SubmitButton'
import { Toggle } from 'components/_primitives/Toggle'
import { useDefaultCard } from 'lib/hooks/useDefaultCard.hook'
import { usePaymentProcessor } from 'lib/hooks/usePaymentProcessor.hook'
import type { IAuctionItemLive } from 'types/auction-item.types'
import type { IPaymentMethod } from 'types/_payment-method.types'
import {
  InstantBuyAddressSection,
  InstantBuyBreadcrumb,
  InstantBuyItemCard,
  InstantBuyNameSection,
  InstantBuyOrderSummary
} from 'app/(public)/auctions/[customAuctionLink]/[auctionItemId]/instant-buy/_components'
import { CoverFeesToggle } from 'components/features/payment/CoverFeesToggle'
import { SavedCardSelector } from 'components/features/payment/SavedCardSelector'
import { calculateStripeFees } from 'lib/utils/fees.utils'
import { updateUserName } from 'lib/actions/my-pack/updateUserName'

interface FormInputs {
  // identity
  firstName: string
  lastName: string
  // address
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  zipPostalCode: string
  // card
  cardComplete: boolean
  selectedCardId: string | null
  useNewCard: boolean
  saveCard: boolean
  // fees
  coverFees: boolean
  // ui
  loading: boolean
  error: string | null
}

interface Props {
  auctionItem: IAuctionItemLive
  savedCards: IPaymentMethod[]
  // from server page — no useSession flash
  isAuthed: boolean
  userEmail: string
  userName: { firstName: string; lastName: string } | null
  userAddress: {
    addressLine1: string | null
    addressLine2?: string | null
    city: string | null
    state: string | null
    zipPostalCode: string | null
  } | null
}

export default function PublicAuctionInstantBuyClient({
  auctionItem,
  savedCards,
  isAuthed,
  userEmail,
  userName,
  userAddress
}: Props) {
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()
  const { setupPusherListenerOneTime } = usePaymentProcessor()

  // ── Local form state ──────────────────────────────────────────────────────
  const [inputs, setInputs] = useState<FormInputs>({
    firstName: userName?.firstName ?? '',
    lastName: userName?.lastName ?? '',
    addressLine1: userAddress?.addressLine1 ?? '',
    addressLine2: userAddress?.addressLine2 ?? '',
    city: userAddress?.city ?? '',
    state: userAddress?.state ?? '',
    zipPostalCode: userAddress?.zipPostalCode ?? '',
    cardComplete: false,
    selectedCardId: savedCards[0]?.stripePaymentId ?? null,
    useNewCard: savedCards.length === 0,
    saveCard: false,
    coverFees: true,
    loading: false,
    error: null
  })

  const patch = (data: Partial<FormInputs>) => setInputs((prev) => ({ ...prev, ...data }))

  // UI-only toggles — not part of the payment payload
  const [editingName, setEditingName] = useState(!userName?.firstName)
  const [editingAddress, setEditingAddress] = useState(!userAddress?.addressLine1)

  // Per-section field errors
  const [nameErrors, setNameErrors] = useState<Record<string, string>>({})
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({})

  // Per-section save loading
  const [savingName, setSavingName] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)

  // ── Derived amounts ───────────────────────────────────────────────────────
  const baseAmount = Number(auctionItem?.buyNowPrice ?? 0)
  const shipping = Number(auctionItem?.shippingCosts ?? 0)
  const processingFee = calculateStripeFees(baseAmount)
  const feesCovered = inputs.coverFees ? processingFee : 0
  const finalAmount = baseAmount + shipping + feesCovered
  const finalAmountInCents = Math.round(finalAmount * 100)

  // ── Payment derived ───────────────────────────────────────────────────────
  const usingSavedCard = isAuthed && !!inputs.selectedCardId && !inputs.useNewCard
  const enteringNewCard = !isAuthed || savedCards.length === 0 || inputs.useNewCard

  const hasName = !!inputs.firstName && !!inputs.lastName && !editingName
  const hasAddress = !!inputs.addressLine1 && !!inputs.city && !!inputs.state && !!inputs.zipPostalCode && !editingAddress

  const addressRequired = !!auctionItem?.requiresShipping
  const addressReady = !addressRequired || hasAddress

  const isValid =
    hasName && addressReady && !inputs.loading && !!stripe && !!elements && (usingSavedCard ? true : inputs.cardComplete)

  // ── Cover photo ───────────────────────────────────────────────────────────
  const coverPhoto = auctionItem?.photos?.sort((a, b) => a.sortOrder - b.sortOrder)[0]?.url

  // ── Default card ──────────────────────────────────────────────────────────
  const setDefaultCard = useCallback((value: string) => patch({ selectedCardId: value }), [])
  useDefaultCard(savedCards, setDefaultCard)

  // ── Name handlers ─────────────────────────────────────────────────────────
  async function handleSaveName() {
    const errs: Record<string, string> = {}
    if (!inputs.firstName.trim()) errs.firstName = 'Required'
    if (!inputs.lastName.trim()) errs.lastName = 'Required'
    if (Object.keys(errs).length) {
      setNameErrors(errs)
      return
    }

    setSavingName(true)
    const result = await updateUserName({
      firstName: inputs.firstName.trim(),
      lastName: inputs.lastName.trim()
    })

    if (!result.success) {
      setNameErrors({ firstName: result.error ?? 'Failed to save' })
      setSavingName(false)
      return
    }

    setNameErrors({})
    setEditingName(false)
    setSavingName(false)
    router.refresh()
  }

  // ── Address handlers ──────────────────────────────────────────────────────
  async function handleSaveAddress() {
    const errs: Record<string, string> = {}
    if (!inputs.addressLine1.trim()) errs.addressLine1 = 'Required'
    if (!inputs.city.trim()) errs.city = 'Required'
    if (!inputs.state.trim()) errs.state = 'Required'
    if (!inputs.zipPostalCode.trim()) errs.zipPostalCode = 'Required'
    if (Object.keys(errs).length) {
      setAddressErrors(errs)
      return
    }

    setSavingAddress(true)
    const result = await updateAddress({
      name: `${inputs.firstName.trim()} ${inputs.lastName.trim()}`,
      addressLine1: inputs.addressLine1.trim(),
      addressLine2: inputs.addressLine2?.trim() || null,
      city: inputs.city.trim(),
      state: inputs.state.trim(),
      zipPostalCode: inputs.zipPostalCode.trim(),
      country: 'US'
    })

    if (!result.success) {
      setAddressErrors({ addressLine1: result.error ?? 'Failed to save' })
      setSavingAddress(false)
      return
    }

    setAddressErrors({})
    setEditingAddress(false)
    setSavingAddress(false)
    router.refresh()
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault()
    if (!stripe || !elements || !isValid) return

    patch({ loading: true, error: null })

    try {
      const name = `${inputs.firstName.trim()} ${inputs.lastName.trim()}`

      const basePayload = {
        amount: finalAmountInCents,
        name,
        email: userEmail,
        orderType: 'AUCTION_PURCHASE' as const,
        coverFees: inputs.coverFees,
        feesCovered,
        auctionItemId: auctionItem?.id
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
          payment_method: {
            card: cardElement,
            billing_details: { name, email: userEmail }
          }
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

  return (
    <main className="min-h-screen bg-bg-light dark:bg-bg-dark" id="main-content">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Nav links */}
        <InstantBuyBreadcrumb
          auctionLink={auctionItem.auction.customAuctionLink}
          auctionItemId={auctionItem.id}
          auctionTitle={auctionItem.auction.title}
        />

        {/* Page title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-px bg-primary-light dark:bg-primary-dark" aria-hidden="true" />
            <span className="  text-f10 uppercase tracking-[0.25em] text-primary-light dark:text-primary-dark">Instant Buy</span>
          </div>
          <h1 className="  text-2xl sm:text-3xl uppercase tracking-widest text-text-light dark:text-text-dark">
            Complete Purchase
          </h1>
        </div>

        <div className="space-y-6">
          {/* Item card */}
          <InstantBuyItemCard
            name={auctionItem.name}
            description={auctionItem.description}
            coverPhoto={coverPhoto}
            requiresShipping={auctionItem.requiresShipping}
            shippingCosts={auctionItem.shippingCosts}
            baseAmount={baseAmount}
          />

          {/* Order summary */}
          <InstantBuyOrderSummary
            baseAmount={baseAmount}
            feesCovered={feesCovered}
            finalAmount={finalAmount}
            coverFees={inputs.coverFees}
            requiresShipping={auctionItem.requiresShipping}
            shippingCosts={auctionItem.shippingCosts}
          />

          {/* ── Name section ── */}
          <InstantBuyNameSection
            firstName={inputs.firstName}
            lastName={inputs.lastName}
            hasName={hasName}
            savingName={savingName}
            nameErrors={nameErrors}
            showCancel={!!userName?.firstName}
            onFirstNameChange={(v) => patch({ firstName: v })}
            onLastNameChange={(v) => patch({ lastName: v })}
            onEdit={() => setEditingName(true)}
            onCancel={() => {
              setEditingName(false)
              setNameErrors({})
            }}
            onSave={handleSaveName}
          />

          {/* ── Address section ── */}
          {addressRequired && (
            <InstantBuyAddressSection
              inputs={inputs}
              hasAddress={hasAddress}
              savingAddress={savingAddress}
              addressErrors={addressErrors}
              showCancel={!!userAddress?.addressLine1}
              onPatch={patch}
              onEdit={() => setEditingAddress(true)}
              onCancel={() => {
                setEditingAddress(false)
                setAddressErrors({})
              }}
              onSave={handleSaveAddress}
            />
          )}

          {/* Payment form */}
          <section aria-label="Payment details">
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {isAuthed && savedCards.length > 0 && (
                <SavedCardSelector
                  savedCards={savedCards}
                  selectedCardId={inputs.selectedCardId}
                  useNewCard={inputs.useNewCard}
                  onSelectCard={(id) => patch({ selectedCardId: id, useNewCard: false })}
                  onUseNewCard={() => patch({ useNewCard: true, selectedCardId: null })}
                  onUseSavedCard={() =>
                    patch({
                      useNewCard: false,
                      selectedCardId: savedCards[0]?.stripePaymentId ?? null
                    })
                  }
                />
              )}

              {enteringNewCard && (
                <>
                  <CardElementField onChange={({ complete, error }) => patch({ cardComplete: complete, error: error ?? null })} />
                  <Toggle
                    id="instant-buy-save-card"
                    label="Save card for future purchases"
                    description="One-click checkout next time"
                    checked={inputs.saveCard}
                    onToggle={() => patch({ saveCard: !inputs.saveCard })}
                  />
                </>
              )}

              <CoverFeesToggle
                checked={inputs.coverFees}
                onChange={() => patch({ coverFees: !inputs.coverFees })}
                processingFee={processingFee}
              />

              <FormError error={inputs.error} />

              <SubmitButton loading={inputs.loading} isValid={isValid} label="Buy Now" price={`$${finalAmount.toFixed(2)}`} />

              <p className="font-lato text-xs text-muted-light dark:text-muted-dark text-center leading-relaxed">
                Your payment is secured by Stripe. Little Paws Dachshund Rescue will never store your card details.
              </p>
            </form>
          </section>
        </div>
      </div>
    </main>
  )
}
