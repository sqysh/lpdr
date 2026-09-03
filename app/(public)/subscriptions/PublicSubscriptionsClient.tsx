'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SUBSCRIPTION_TIERS } from 'lib/constants/subscriptions.constants'
import { IPaymentMethod } from 'types/_payment-method.types'
import { useRouter, useSearchParams } from 'next/navigation'
import Picture from 'components/_common/Picture'
import { StickyHeader } from './_components/StickyHeader'
import { SubscriptionSelector } from './_components/SubscriptionSelector'
import { SubscriptionPaymentView } from './_components/SubscriptionPaymentView'
import { StickyBar } from './_components/StickyBar'
import { BillingInterval, SubscriptionTierId } from 'types/_subscriptions.types'

type View = 'select' | 'payment'

type IPublicSubscriptionsClient = {
  savedPaymentMethods: IPaymentMethod[]
  userName: { firstName: string; lastName: string }
}

export default function PublicSubscriptionsClient({ savedPaymentMethods, userName }: IPublicSubscriptionsClient) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const urlTier = searchParams.get('tier')
  const urlView = searchParams.get('view') as View | null
  const urlBilling = searchParams.get('billing') as BillingInterval | null

  const [billing, setBilling] = useState<BillingInterval>(urlBilling === 'YEARLY' ? 'YEARLY' : 'MONTHLY')
  const isTierId = (v: string | null): v is SubscriptionTierId => SUBSCRIPTION_TIERS.some((t) => t.id === v)
  const seededTier = isTierId(urlTier) ? urlTier : null
  const [view, setView] = useState<View>(urlView === 'payment' && seededTier ? 'payment' : 'select')
  const [selected, setSelected] = useState<SubscriptionTierId | null>(seededTier)
  const selectedTier = SUBSCRIPTION_TIERS.find((t) => t.id === selected)

  const syncUrl = (next: { billing?: BillingInterval; view?: View; tier?: string | null }) => {
    const params = new URLSearchParams(searchParams.toString())

    if (next.billing) params.set('billing', next.billing)
    if (next.view) params.set('view', next.view)
    if (next.tier !== undefined) {
      if (next.tier) params.set('tier', next.tier)
      else params.delete('tier')
    }

    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const handleBilling = (value: BillingInterval) => {
    setBilling(value)
    syncUrl({ billing: value })
  }

  const handleSelect = (value: SubscriptionTierId | null) => {
    setSelected(value)
    syncUrl({ tier: value })
  }

  const handleView = (value: View) => {
    setView(value)
    syncUrl({ view: value })
  }

  return (
    <main id="main-content" className="dark relative min-h-dvh text-text-dark bg-bg-dark">
      <StickyHeader billing={billing} selected={selected} onSubscribe={() => setView('payment')} view={view} />
      {view === 'select' && (
        <motion.div
          className="w-fit -ml-4 xs:-ml-6 sm:-ml-10 fixed -bottom-7 left-0"
          animate={{ y: [0, -6, 0], opacity: [0.7, 1, 0.7] }}
          transition={{
            duration: 4,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatType: 'loop'
          }}
        >
          <Picture
            src="/images/cartoon-dachshund-1.png"
            className="h-48 xs:h-64 sm:h-96 1000:h-128 1200:h-160 w-auto object-contain"
            priority
          />
        </motion.div>
      )}
      <AnimatePresence mode="wait">
        {/* ── VIEW: SELECT ── */}
        {view === 'select' && (
          <SubscriptionSelector billing={billing} selected={selected} setBilling={handleBilling} setSelected={handleSelect} />
        )}

        {/* ── VIEW: PAYMENT ── */}
        {view === 'payment' && selectedTier && (
          <SubscriptionPaymentView
            billing={billing}
            savedPaymentMethods={savedPaymentMethods}
            selectedTier={selectedTier}
            setView={setView}
            userName={userName}
          />
        )}
      </AnimatePresence>

      {/* ── STICKY BAR ── */}
      {view === 'select' && <StickyBar billing={billing} selected={selected} selectedTier={selectedTier} setView={handleView} />}
    </main>
  )
}
