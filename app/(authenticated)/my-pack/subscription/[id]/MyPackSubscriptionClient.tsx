'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CreditCard, RefreshCw, Check } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { store } from 'lib/store/store'
import { showToast } from 'lib/store/slices/toastSlice'
import { fadeUp } from 'lib/constants/motion.constants'
import { formatMoney } from 'lib/utils/currency.utils'
import { formatDate } from 'lib/utils/date.utils'
import { getSubscriptionById } from 'lib/actions/my-pack/getSubscriptionById'
import { cancelSubscription } from 'lib/actions/_stripe/cancelSubscription'
import { UpdateCardForm } from 'app/(authenticated)/my-pack/subscription/[id]/_components/UpdateCardForm'
import { CancelSubscriptionModal } from 'app/(authenticated)/my-pack/subscription/[id]/_components/CancelSubscriptionModal'

type Subscription = Awaited<ReturnType<typeof getSubscriptionById>>['data']

export default function MyPackSubscriptionClient({
  subscription
}: {
  subscription: NonNullable<Subscription>
}) {
  const router = useRouter()

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showUpdateCard, setShowUpdateCard] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)

  const isCancelled = subscription.cancelAtPeriodEnd || subscription.stripeStatus === 'canceled'
  const frequencyLabel = subscription.recurringFrequency === 'MONTHLY' ? 'Monthly' : 'Yearly'
  const frequencyShort = subscription.recurringFrequency === 'MONTHLY' ? 'mo' : 'yr'

  const handleCancel = async () => {
    setCancelLoading(true)
    try {
      const result = await cancelSubscription({
        subscriptionId: subscription.stripeSubscriptionId!
      })
      if (!result.success) throw new Error(result.error ?? 'Failed to cancel')
      store.dispatch(
        showToast({
          message: 'Subscription cancelled',
          description: 'Your subscription will not renew.',
          type: 'success'
        })
      )
      setShowCancelModal(false)
      router.refresh()
    } catch (err) {
      store.dispatch(showToast({ message: 'Failed to cancel subscription', type: 'error' }))
    } finally {
      setCancelLoading(false)
    }
  }

  return (
    <main
      id="main-content"
      className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-24 sm:pb-32">
        {/* ── Header ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="mb-10">
          <Link
            href=" /my-pack"
            className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:underline mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            My Pack
          </Link>

          <div className="flex items-center gap-3 mb-3">
            <span
              className="block w-6 h-px bg-primary-light dark:bg-primary-dark shrink-0"
              aria-hidden="true"
            />
            <p className="text-xs font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
              Subscription
            </p>
          </div>

          <div className="flex items-start justify-between gap-4">
            <h1 className="font-quicksand text-4xl sm:text-5xl font-black text-text-light dark:text-text-dark leading-tight">
              {frequencyLabel}{' '}
              <span className="font-light text-muted-light dark:text-muted-dark">Membership</span>
            </h1>
            {isCancelled && (
              <span className="shrink-0 mt-2 px-2.5 py-1 border border-red-500/30 text-[9px] font-mono tracking-[0.15em] uppercase text-red-500 dark:text-red-400">
                Cancelled
              </span>
            )}
          </div>
        </motion.div>

        {/* ── Overview card ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="border border-border-light dark:border-border-dark mb-6"
        >
          <div className="px-5 py-4 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
              Overview
            </p>
          </div>

          <div className="divide-y divide-border-light dark:divide-border-dark">
            {[
              {
                label: 'Amount',
                value: (
                  <span className="font-quicksand font-black text-lg text-primary-light dark:text-primary-dark tabular-nums">
                    {formatMoney(subscription.totalAmount)}
                    <span className="text-[10px] font-mono font-normal text-muted-light dark:text-muted-dark ml-1">
                      /{frequencyShort}
                    </span>
                  </span>
                )
              },
              {
                label: 'Frequency',
                value: (
                  <span className="text-sm font-mono text-text-light dark:text-text-dark">
                    {frequencyLabel}
                  </span>
                )
              },
              {
                label: 'Status',
                value: (
                  <span
                    className={`text-[10px] font-mono tracking-[0.15em] uppercase ${
                      isCancelled
                        ? 'text-red-500 dark:text-red-400'
                        : 'text-primary-light dark:text-primary-dark'
                    }`}
                  >
                    {isCancelled ? 'Cancelled' : (subscription.stripeStatus ?? subscription.status)}
                  </span>
                )
              },
              {
                label: 'Member since',
                value: (
                  <span className="text-sm font-mono text-text-light dark:text-text-dark">
                    {formatDate(subscription.createdAt, true)}
                  </span>
                )
              },
              {
                label: 'Last payment',
                value: (
                  <span className="text-sm font-mono text-text-light dark:text-text-dark">
                    {subscription.paidAt ? formatDate(subscription.paidAt) : '—'}
                  </span>
                )
              },
              {
                label: isCancelled ? 'Active until' : 'Next billing',
                value: (
                  <span
                    className={`text-sm font-mono ${isCancelled ? 'text-red-500 dark:text-red-400' : 'text-text-light dark:text-text-dark'}`}
                  >
                    {subscription.nextBillingDate ? formatDate(subscription.nextBillingDate) : '—'}
                  </span>
                )
              },
              ...(subscription.coverFees
                ? [
                    {
                      label: 'Fees covered',
                      value: (
                        <span className="text-sm font-mono text-text-light dark:text-text-dark">
                          {formatMoney(subscription.feesCovered)}
                        </span>
                      )
                    }
                  ]
                : [])
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-5 py-3.5 gap-4">
                <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark shrink-0">
                  {label}
                </span>
                <div className="text-right">{value}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Payment method ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="border border-border-light dark:border-border-dark mb-6"
        >
          <div className="px-5 py-4 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark flex items-center justify-between">
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
              Payment Method
            </p>
            {!isCancelled && !showUpdateCard && (
              <button
                type="button"
                onClick={() => setShowUpdateCard(true)}
                className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:underline"
              >
                <RefreshCw className="w-3 h-3" aria-hidden="true" />
                Update
              </button>
            )}
          </div>

          <div className="px-5 py-4">
            {showUpdateCard ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <UpdateCardForm
                  subscriptionId={subscription.stripeSubscriptionId!}
                  onSuccess={() => {
                    setShowUpdateCard(false)
                    router.refresh()
                  }}
                  onCancel={() => setShowUpdateCard(false)}
                />
              </motion.div>
            ) : subscription.paymentMethod ? (
              <div className="flex items-center gap-3">
                <CreditCard
                  className="w-4 h-4 text-muted-light dark:text-muted-dark shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-mono text-text-light dark:text-text-dark capitalize">
                    {subscription.paymentMethod.brand} •••• {subscription.paymentMethod.last4}
                  </p>
                  <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-0.5">
                    Expires {subscription.paymentMethod.expMonth?.toString().padStart(2, '0')}/
                    {subscription.paymentMethod.expYear}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm font-mono text-muted-light dark:text-muted-dark">
                No payment method on file.
              </p>
            )}
          </div>
        </motion.div>

        {/* ── Billing history ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={3}
          className="border border-border-light dark:border-border-dark mb-8"
        >
          <div className="px-5 py-4 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
              Billing History
            </p>
          </div>

          {subscription.billingHistory?.length > 0 ? (
            <ul className="divide-y divide-border-light dark:divide-border-dark" role="list">
              {subscription.billingHistory.map((payment) => (
                <li
                  key={payment.id}
                  className="flex items-center justify-between px-5 py-3.5 gap-4"
                  role="listitem"
                >
                  <div className="flex items-center gap-3">
                    <Check
                      className="w-3.5 h-3.5 text-primary-light dark:text-primary-dark shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-xs font-mono text-muted-light dark:text-muted-dark">
                      {formatDate(payment.paidAt ?? payment.createdAt)}
                    </span>
                  </div>
                  <span className="font-mono text-sm text-text-light dark:text-text-dark tabular-nums">
                    {formatMoney(Number(payment.totalAmount))}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-8 text-center">
              <p className="text-sm font-mono text-muted-light dark:text-muted-dark">
                No billing history yet.
              </p>
            </div>
          )}
        </motion.div>

        {/* ── Cancel ── */}
        {!isCancelled && (
          <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}>
            <div className="h-px bg-border-light dark:bg-border-dark mb-6" aria-hidden="true" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-mono text-text-light dark:text-text-dark mb-1">
                  Cancel subscription
                </p>
                <p className="text-[11px] font-mono text-muted-light dark:text-muted-dark leading-relaxed max-w-xs">
                  Your membership will remain active until the end of the current billing period.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="shrink-0 px-4 py-2.5 text-[10px] font-mono tracking-[0.2em] uppercase border border-red-500/30 text-red-500 dark:text-red-400 hover:bg-red-500/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Cancel modal ── */}
      <AnimatePresence>
        {showCancelModal && (
          <CancelSubscriptionModal
            onConfirm={handleCancel}
            onClose={() => setShowCancelModal(false)}
            loading={cancelLoading}
            cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
            nextBillingDate={subscription.nextBillingDate}
          />
        )}
      </AnimatePresence>
    </main>
  )
}
