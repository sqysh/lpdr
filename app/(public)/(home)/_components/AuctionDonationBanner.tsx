'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Mail } from 'lucide-react'
import { FormError, FormField, SubmitButton } from 'components/_primitives'
import { INBOX, mailto } from 'lib/constants/email.constants'
import { auctionOfferSchema, type AuctionOfferInput } from 'lib/schemas/auction-offer.schema'
import { offerAuctionItem } from 'lib/actions/public/auction/offerAuctionItem'

const IDEAS = ['Handmade', 'Store bought', 'Holiday gifts', 'Dachshund or not']

function OfferForm({ onSent }: { onSent: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const [renderedAt] = useState(() => Date.now())

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<AuctionOfferInput>({
    resolver: zodResolver(auctionOfferSchema),
    defaultValues: { name: '', email: '', item: '', value: '', notes: '', website: '', renderedAt }
  })

  const onSubmit = async (values: AuctionOfferInput) => {
    setError(null)
    const result = await offerAuctionItem(values)
    if (result.success) onSent()
    else setError(result.error)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField id="offer-name" label="Your name" autoComplete="name" {...register('name')} error={errors.name?.message} />
        <FormField id="offer-email" label="Email" type="email" autoComplete="email" {...register('email')} error={errors.email?.message} />
      </div>
      <FormField id="offer-item" label="What's the item?" {...register('item')} error={errors.item?.message} />
      <FormField
        id="offer-value"
        label="Approximate value (optional)"
        inputMode="decimal"
        {...register('value')}
        error={errors.value?.message}
      />
      <FormField
        id="offer-notes"
        label="Anything else? (optional)"
        type="textarea"
        hint="Photos, sizes, or how you'd get it to us"
        {...register('notes')}
        error={errors.notes?.message}
      />

      {/* Honeypot: hidden from people, filled in by bots */}
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" {...register('website')} />

      <FormError error={error} />
      <SubmitButton loading={isSubmitting} isValid label="Send my offer" />
    </form>
  )
}

export function AuctionDonationsBanner() {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)

  return (
    <section
      aria-labelledby="auction-donations-heading"
      className="w-full px-4 xs:px-5 sm:px-6 lg:px-8 py-20 sm:py-28 mt-16 bg-surface-light dark:bg-surface-dark"
    >
      <div className="max-w-300 mx-auto grid grid-cols-1 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-16 items-center">
        {' '}
        <figure className="relative mr-4 mb-4 max-w-md md:max-w-none">
          <div aria-hidden="true" className="absolute inset-0 translate-x-4 translate-y-4 bg-topbar-light dark:bg-topbar-dark" />
          <div className="relative aspect-square overflow-hidden">
            <Image
              src="/images/auction/boss-hat.jpg"
              alt="Boss, a little paws alum, in a grey knit hat"
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="absolute left-3 bottom-3 px-2.5 py-1 bg-bg-light/90 dark:bg-bg-dark/90 backdrop-blur text-[9px] font-mono tracking-tag uppercase text-text-light dark:text-text-dark">
            Alum Boss, in his brand new hat
          </figcaption>
        </figure>
        <div>
          <div className="flex items-center gap-3" aria-hidden="true">
            <div className="w-6 sm:w-8 h-px bg-primary-light dark:bg-primary-dark" />
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-light dark:text-muted-dark font-nunito">
              Holiday Auction
            </p>
          </div>

          <h2
            id="auction-donations-heading"
            className="mt-2 font-quicksand leading-tight text-text-light dark:text-text-dark"
            style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}
          >
            <span className="font-black block">SEEKING</span>
            <span className="font-light">AUCTION DONATIONS</span>
          </h2>

          <p className="mt-5 text-base text-text-light dark:text-text-dark leading-relaxed max-w-xl">
            Makers, artisans and shoppers, would you like to donate an item to our Holiday Auction? 100% of what it raises goes to our
            current and future foster dogs, aka vet bills.
          </p>

          <ul className="mt-5 flex flex-wrap gap-2" aria-label="What we're looking for">
            {IDEAS.map((idea) => (
              <li
                key={idea}
                className="px-2.5 py-1 border border-border-light dark:border-border-dark text-[10px] font-mono tracking-tag uppercase text-muted-light dark:text-muted-dark"
              >
                {idea}
              </li>
            ))}
          </ul>

          {sent ? (
            <p role="status" className="mt-7 flex items-start gap-2 text-sm text-emerald-700 dark:text-emerald-400">
              <Check className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              Thank you! Your offer is on its way to our auction team, and they&apos;ll reply by email.
            </p>
          ) : open ? (
            <OfferForm onSent={() => setSent(true)} />
          ) : (
            <div className="mt-7 flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center justify-center px-6 py-3.5 bg-primary-light dark:bg-primary-dark text-white text-[10px] font-mono tracking-eyebrow uppercase hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                Offer an item
              </button>
              <a
                href={mailto(INBOX.auctions, 'Holiday auction donation')}
                className="inline-flex items-center gap-1.5 text-[11px] font-mono text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark"
              >
                <Mail className="w-3 h-3" aria-hidden="true" />
                or email {INBOX.auctions}
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
