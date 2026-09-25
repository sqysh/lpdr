'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { updateAddress } from 'lib/actions/my-pack/updateAddress'
import type { IAuctionItemLive } from 'types/auction.types'
import type { IPaymentMethod } from 'types/payment-method.types'
import {
  InstantBuyAddressSection,
  InstantBuyBreadcrumb,
  InstantBuyItemCard,
  InstantBuyNameSection,
  InstantBuyOrderSummary
} from 'app/(public)/auctions/[customAuctionLink]/[auctionItemId]/instant-buy/_components'
import { calculateStripeFees } from 'lib/utils/fees.utils'
import { updateUserName } from 'lib/actions/my-pack/updateUserName'
import { AuctionPaymentInput, auctionPaymentSchema, AuctionPaymentValues } from 'lib/schemas/auction.schema'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useStripeCheckout } from '@hooks/useStripeCheckout.hook'
import { OrderType } from '@prisma/client'
import { IAddress } from 'types/address.types'
import { PaymentSection } from 'components/features/payment/PaymentSection'
import { useRefreshOnSignOut } from '@hooks/useRefreshOnSignOut.hook'

interface Props {
  auctionItem: IAuctionItemLive
  savedCards: IPaymentMethod[]
  userEmail: string
  userName: { firstName: string; lastName: string } | null
  userAddress: Pick<IAddress, 'addressLine1' | 'addressLine2' | 'city' | 'state' | 'zipPostalCode'> | null
  userId: string
  isAuthed: boolean
}

export default function PublicAuctionInstantBuyClient({
  auctionItem,
  savedCards,
  userEmail,
  userName,
  userAddress,
  userId,
  isAuthed
}: Props) {
  const router = useRouter()

  useRefreshOnSignOut(isAuthed)

  const DEFAULT_VALUES = {
    firstName: userName?.firstName ?? '',
    lastName: userName?.lastName ?? '',
    addressLine1: userAddress?.addressLine1 ?? '',
    addressLine2: userAddress?.addressLine2 ?? '',
    city: userAddress?.city ?? '',
    state: userAddress?.state ?? '',
    zipPostalCode: userAddress?.zipPostalCode ?? ''
  }

  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors },
    setError
  } = useForm<AuctionPaymentInput, unknown, AuctionPaymentValues>({
    resolver: zodResolver(auctionPaymentSchema),
    mode: 'onBlur',
    defaultValues: DEFAULT_VALUES
  })

  const values = useWatch({ control })

  const { payment, patch, usingSavedCard, pay, ready } = useStripeCheckout({
    savedCards,
    isAuthed: true,
    userId,
    billingName: `${values.firstName} ${values.lastName}`,
    billingEmail: userEmail
  })

  // ── UI-only toggles — not part of the payment payload ──
  const [editingName, setEditingName] = useState(!userName?.firstName)
  const [editingAddress, setEditingAddress] = useState(!userAddress?.addressLine1)

  // ── Per-section save loading ──
  const [savingName, setSavingName] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)

  // ── Payment derived ──
  const baseAmount = Number(auctionItem?.buyNowPrice ?? 0)
  const shipping = Number(auctionItem?.shippingCosts ?? 0)
  const subtotal = baseAmount + shipping
  const processingFee = calculateStripeFees(subtotal)
  const feesCovered = payment.coverFees ? processingFee : 0
  const finalAmount = Math.round((subtotal + feesCovered) * 100) / 100

  // ── Name and address derived ──
  const hasName = !!values.firstName && !!values.lastName && !editingName
  const hasAddress = !!values.addressLine1 && !!values.city && !!values.state && !!values.zipPostalCode && !editingAddress
  const addressRequired = !!auctionItem?.requiresShipping
  const addressReady = !addressRequired || hasAddress

  const isValid = hasName && addressReady && !payment.loading && ready && (usingSavedCard ? true : payment.cardComplete)

  // ── Cover photo ───────────────────────────────────────────────────────────
  const coverPhoto = auctionItem?.photos?.sort((a, b) => a.sortOrder - b.sortOrder)[0]?.url

  const handleSaveName = async () => {
    const ok = await trigger(['firstName', 'lastName'])
    if (!ok) return

    setSavingName(true)
    const result = await updateUserName({ firstName: values.firstName!, lastName: values.lastName! })
    setSavingName(false)

    if (!result.success) {
      setError('firstName', { message: result.error ?? 'Failed to save' })
      return
    }

    setEditingName(false)
    router.refresh()
  }

  const handleSaveAddress = async () => {
    const ok = await trigger(['addressLine1', 'city', 'state', 'zipPostalCode'])
    if (!ok) return

    // The schema defaults these to empty, so required-ness is checked here
    const missing = (['addressLine1', 'city', 'state', 'zipPostalCode'] as const).filter((f) => !values[f]?.trim())

    if (missing.length) {
      for (const f of missing) setError(f, { message: 'Required' })
      return
    }

    setSavingAddress(true)

    const result = await updateAddress({
      name: `${values.firstName} ${values.lastName}`,
      addressLine1: values.addressLine1!,
      addressLine2: values.addressLine2 || null,
      city: values.city!,
      state: values.state!,
      zipPostalCode: values.zipPostalCode!,
      country: 'US'
    })

    setSavingAddress(false)

    if (!result.success) {
      setError('addressLine1', { message: result.error ?? 'Failed to save' })
      return
    }

    setEditingAddress(false)
    router.refresh()
  }

  const onSubmit = () =>
    pay({
      orderType: 'AUCTION_PURCHASE' as OrderType,
      coverFees: payment.coverFees,
      auctionItemId: auctionItem.id
    })

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
            <span className="text-f10 uppercase tracking-[0.25em] text-primary-light dark:text-primary-dark">Instant Buy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl uppercase tracking-widest text-text-light dark:text-text-dark">Complete Purchase</h1>
        </div>

        <div className="space-y-6">
          {/* ── Item card ── */}
          <InstantBuyItemCard
            name={auctionItem.name}
            description={auctionItem.description}
            coverPhoto={coverPhoto}
            requiresShipping={auctionItem.requiresShipping}
            shippingCosts={auctionItem.shippingCosts}
            baseAmount={baseAmount}
          />

          {/* ── Order summary ── */}
          <InstantBuyOrderSummary
            baseAmount={baseAmount}
            feesCovered={feesCovered}
            finalAmount={finalAmount}
            coverFees={payment.coverFees}
            requiresShipping={auctionItem.requiresShipping}
            shippingCosts={auctionItem.shippingCosts}
          />

          {/* ── Name section ── */}
          <InstantBuyNameSection
            register={register}
            control={control}
            errors={errors}
            editing={editingName}
            saving={savingName}
            showCancel={!!userName?.firstName}
            onEdit={() => setEditingName(true)}
            onCancel={() => setEditingName(false)}
            onSave={handleSaveName}
          />

          {/* ── Address section ── */}
          {addressRequired && (
            <InstantBuyAddressSection
              register={register}
              control={control}
              errors={errors}
              editing={editingAddress}
              saving={savingAddress}
              showCancel={!!userAddress?.addressLine1}
              onEdit={() => setEditingAddress(true)}
              onCancel={() => setEditingAddress(false)}
              onSave={handleSaveAddress}
            />
          )}

          {/* ── Payment section ── */}
          <section aria-label="Payment details">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <PaymentSection
                payment={payment}
                patch={patch}
                savedCards={savedCards}
                processingFee={processingFee}
                isValid={isValid}
                submitLabel="Buy Now"
                submitPrice={finalAmount}
              />
            </form>
          </section>
        </div>
      </div>
    </main>
  )
}
