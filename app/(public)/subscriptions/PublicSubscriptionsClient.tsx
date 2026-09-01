'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TIERS } from 'lib/constants/subscriptions.constants'
import { IPaymentMethod } from 'types/_payment-method.types'
import { useSearchParams } from 'next/navigation'
import Picture from 'components/_common/Picture'
import { StickyHeader } from './_components/StickyHeader'
import { SubscriptionSelector } from './_components/SubscriptionSelector'
import { SubscriptionPaymentView } from './_components/SubscriptionPaymentView'
import { StickyBar } from './_components/StickyBar'

type IPublicSubscriptionsClient = {
  savedPaymentMethods: IPaymentMethod[]
  userName: { firstName: string; lastName: string }
}

export default function PublicSubscriptionsClient({
  savedPaymentMethods,
  userName
}: IPublicSubscriptionsClient) {
  const searchParams = useSearchParams()
  const [billing, setBilling] = useState<'MONTHLY' | 'YEARLY'>(
    (searchParams.get('billing') as 'MONTHLY' | 'YEARLY') ?? 'MONTHLY'
  )
  const [view, setView] = useState<'select' | 'payment'>(
    (searchParams.get('view') as 'select' | 'payment') ?? 'select'
  )
  const [selected, setSelected] = useState<string | null>(searchParams.get('tier'))

  const selectedTier = TIERS.find((t) => t.id === selected)

  return (
    <main id="main-content" className="dark relative min-h-dvh text-text-dark bg-bg-dark">
      <StickyHeader
        billing={billing as 'monthly' | 'yearly'}
        onSubscribe={() => setView('payment')}
        selected={selected}
        view={view}
      />
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
          <SubscriptionSelector
            billing={billing}
            selected={selected}
            setBilling={setBilling}
            setSelected={setSelected}
          />
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
      {view === 'select' && (
        <StickyBar
          billing={billing}
          selected={selected}
          selectedTier={selectedTier}
          setView={setView}
        />
      )}
    </main>
  )
}
