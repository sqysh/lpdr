'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  CheckCircle,
  ArrowRight,
  Receipt,
  Package,
  Heart,
  ChevronLeft,
  User,
  Utensils
} from 'lucide-react'
import { fadeUp } from 'lib/constants/motion.constants'
import Picture from 'components/_common/Picture'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { ORDER_TYPE_CONFIG } from 'lib/constants/order.constants'
import { formatWithCommas } from 'lib/utils/currency.utils'
import { useSearchParams } from 'next/navigation'
import { ITEM_ICONS } from 'lib/constants/feed-a-foster.constants'
import { useCartStore } from 'stores/cart.store'
import { useConfettiStore } from 'stores/confetti.store'

export default function OrderConfirmationClient({ order }) {
  const clearCart = useCartStore((s) => s.clearCart)
  const showConfetti = useConfettiStore((s) => s.show)
  const config = ORDER_TYPE_CONFIG[order?.type] ?? ORDER_TYPE_CONFIG['ONE_TIME_DONATION']
  const subtotal = Number(order?.totalAmount) - Number(order?.coverFees ? order?.feesCovered : 0)
  const session = useSession()
  const searchParams = useSearchParams()
  const isNewOrder = searchParams.get('ref') === 'new'
  const isAdminView = searchParams.get('ref') === 'admin'
  const myPackTab = !isNewOrder && !isAdminView ? searchParams.get('ref') : ''

  useEffect(() => {
    clearCart()
    if (isNewOrder) {
      showConfetti()
    }
  }, [clearCart, isNewOrder, showConfetti])

  const typeCode = order?.type === 'RECURRING_DONATION' ? 'RD' : 'DN'

  return (
    <div className="min-h-dvh bg-white dark:bg-bg-dark">
      {/* ── Fixed full-bleed header bar ── */}
      <motion.header
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0}
        className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200 dark:border-border-dark bg-white/90 dark:bg-bg-dark/90 backdrop-blur-sm"
      >
        <div className="px-4 430:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-4 h-px bg-cyan-600 dark:bg-violet-400" aria-hidden="true" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-cyan-600 dark:text-violet-400">
              Little Paws Dachshund Rescue
            </span>
          </div>
          {isAdminView ? (
            <Link
              href={`/admin/orders/${order.id}`}
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-zinc-400 dark:text-muted-dark hover:text-cyan-600 dark:hover:text-violet-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:focus-visible:ring-violet-400"
            >
              <ChevronLeft className="w-3 h-3" aria-hidden="true" />
              Back to Order
            </Link>
          ) : session?.data?.user ? (
            <Link
              href="/my-pack"
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-zinc-400 dark:text-muted-dark hover:text-cyan-600 dark:hover:text-violet-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:focus-visible:ring-violet-400"
            >
              <User className="w-3 h-3" aria-hidden="true" />
              My Pack
            </Link>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-zinc-400 dark:text-muted-dark hover:text-cyan-600 dark:hover:text-violet-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:focus-visible:ring-violet-400"
            >
              <ChevronLeft className="w-3 h-3" aria-hidden="true" />
              Home
            </Link>
          )}
        </div>
      </motion.header>

      {/* ── Constrained content — padded to clear the fixed bar ── */}
      <div className="max-w-2xl mx-auto px-4 430:px-6 pt-24 430:pt-28 pb-12 430:pb-16">
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="mb-10">
          <div className="flex items-start gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
              className="relative shrink-0"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-cyan-600/10 dark:bg-violet-400/10">
                <CheckCircle
                  className="w-5 h-5 text-cyan-600 dark:text-violet-400"
                  aria-hidden="true"
                />
              </div>
              <motion.div
                animate={{
                  scale: [0.8, 1.8, 0.8],
                  opacity: [0.5, 0, 0]
                }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: 'easeOut',
                  times: [0, 0.7, 1]
                }}
                className="absolute inset-0 bg-cyan-600/20 dark:bg-violet-400/20"
                aria-hidden="true"
              />
            </motion.div>
            <div>
              <p className="  text-[10px] uppercase tracking-[0.25em] text-cyan-600 dark:text-violet-400 mb-1">
                {config.label}
              </p>
              <h1 className="  text-3xl 430:text-4xl uppercase leading-none text-zinc-950 dark:text-text-dark mb-2">
                Thank you, {order?.customerName}!
              </h1>
              <p className="font-lato text-sm text-zinc-500 dark:text-muted-dark leading-relaxed max-w-lg">
                {config.message}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Receipt ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="border border-zinc-200 dark:border-border-dark mb-6"
        >
          {/* Receipt header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-border-dark bg-zinc-50 dark:bg-white/2">
            <div className="flex items-center gap-2">
              <Receipt
                className="w-3.5 h-3.5 text-zinc-400 dark:text-muted-dark/50"
                aria-hidden="true"
              />
              <span className="  text-[10px] uppercase tracking-[0.25em] text-zinc-500 dark:text-muted-dark">
                Receipt
              </span>
            </div>
            <span className="  text-[10px] uppercase tracking-[0.15em] text-zinc-400 dark:text-muted-dark/50 font-mono">
              #{order?.id.slice(-8).toUpperCase()}
            </span>
          </div>

          {/* Items */}
          {order?.items.length > 0 ? (
            <div className="divide-y divide-zinc-200 dark:divide-border-dark">
              {order?.items.map((item) => {
                const Icon = item.iconKey ? (ITEM_ICONS[item.iconKey] ?? Utensils) : null
                return (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="shrink-0 w-10 h-10 bg-zinc-100 dark:bg-white/5 overflow-hidden">
                      {item.itemImage ? (
                        <Picture
                          priority={true}
                          src={item.itemImage}
                          alt={item.itemName ?? 'Item'}
                          className="w-full h-full object-cover"
                        />
                      ) : Icon ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon
                            className="w-4 h-4 text-zinc-400 dark:text-muted-dark/30"
                            aria-hidden="true"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package
                            className="w-4 h-4 text-zinc-400 dark:text-muted-dark/30"
                            aria-hidden="true"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs uppercase tracking-wide text-zinc-950 dark:text-text-dark truncate">
                        {item.itemName ?? 'Item'}
                      </p>
                      {item.quantity && item.quantity > 1 && (
                        <p className="font-lato text-[10px] text-zinc-400 dark:text-muted-dark/50 mt-0.5">
                          Qty: {item.quantity}
                        </p>
                      )}
                      {item.isPhysical && (
                        <p className="font-lato text-[10px] text-zinc-400 dark:text-muted-dark/50 mt-0.5">
                          Shipping details to follow
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-sm tabular-nums text-zinc-950 dark:text-text-dark">
                      ${(item.totalPrice ?? item.price).toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="shrink-0 w-10 h-10 border border-zinc-200 dark:border-border-dark flex items-center justify-center">
                <span className="font-mono text-[10px] font-bold tracking-widest text-zinc-400 dark:text-muted-dark/50">
                  {typeCode}
                </span>
              </div>
              <div className="flex flex-col">
                <p className="  text-xs uppercase tracking-wide text-zinc-950 dark:text-text-dark">
                  {order?.type === 'RECURRING_DONATION'
                    ? 'Recurring Donation'
                    : 'One-Time Donation'}
                </p>
                {order?.tierName && (
                  <p className="  text-xs uppercase tracking-wide text-zinc-400 dark:text-muted-dark/50">
                    {order.tierName}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="px-5 py-4 border-t border-zinc-200 dark:border-border-dark space-y-2.5">
            {order?.coverFees && Number(order?.feesCovered) > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <span className="font-lato text-xs text-zinc-500 dark:text-muted-dark">
                    Subtotal
                  </span>
                  <span className="  text-xs tabular-nums text-zinc-950 dark:text-text-dark">
                    ${formatWithCommas(subtotal.toFixed(2))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-lato text-xs text-zinc-500 dark:text-muted-dark">
                    Processing fees covered
                  </span>
                  <span className="  text-xs tabular-nums text-zinc-950 dark:text-text-dark">
                    +${Number(order?.feesCovered).toFixed(2)}
                  </span>
                </div>
              </>
            )}
            {order?.isRecurring && order?.recurringFrequency && (
              <div className="flex justify-between items-center">
                <span className="font-lato text-xs text-zinc-500 dark:text-muted-dark">
                  Frequency
                </span>
                <span className="  text-xs tabular-nums text-zinc-950 dark:text-text-dark capitalize">
                  {order?.recurringFrequency.toLowerCase()}
                </span>
              </div>
            )}
            <div
              className={`flex justify-between items-center ${
                (order?.coverFees && Number(order?.feesCovered) > 0) ||
                (order?.isRecurring && order?.recurringFrequency)
                  ? 'pt-2.5 border-t border-zinc-200 dark:border-border-dark'
                  : ''
              }`}
            >
              <span className="  text-xs uppercase tracking-wide text-zinc-950 dark:text-text-dark">
                Total
              </span>
              <span className="  text-2xl tabular-nums text-cyan-600 dark:text-violet-400">
                ${formatWithCommas(order?.totalAmount.toFixed(2))}
              </span>
            </div>
          </div>

          {/* Meta */}
          <div className="px-5 py-4 border-t border-zinc-200 dark:border-border-dark bg-zinc-50 dark:bg-white/2 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-lato text-[10px] text-zinc-400 dark:text-muted-dark/50">
                Email
              </span>
              <span className="font-lato text-[10px] text-zinc-600 dark:text-muted-dark truncate max-w-50">
                {order?.customerEmail}
              </span>
            </div>
            {order?.paidAt && (
              <div className="flex justify-between items-center">
                <span className="font-lato text-[10px] text-zinc-400 dark:text-muted-dark/50">
                  Date
                </span>
                <span className="font-lato text-[10px] text-zinc-600 dark:text-muted-dark">
                  {new Date(order?.paidAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}
            {order?.isRecurring && order?.nextBillingDate && (
              <div className="flex justify-between items-center">
                <span className="font-lato text-[10px] text-zinc-400 dark:text-muted-dark/50">
                  Next billing
                </span>
                <span className="font-lato text-[10px] text-zinc-600 dark:text-muted-dark">
                  {new Date(order?.nextBillingDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Confirmation email note ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="flex items-start gap-3 px-4 py-3 mb-6 border-l-2 border-cyan-600 dark:border-violet-400 bg-cyan-600/5 dark:bg-violet-400/5"
          role="note"
        >
          <Heart
            className="w-3.5 h-3.5 text-cyan-600 dark:text-violet-400 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <p className="font-lato text-xs text-zinc-500 dark:text-muted-dark leading-relaxed">
            A confirmation email has been sent to &nbsp;{' '}
            <strong className="text-zinc-950 dark:text-text-dark">{order?.customerEmail}</strong>
          </p>
        </motion.div>

        {/* ── Actions ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={3}
          className="flex flex-col 430:flex-row gap-3"
        >
          {isAdminView ? (
            <Link
              href={`/admin/orders/${order.id}`}
              className="flex-1 flex items-center justify-center px-6 py-3.5 text-sm uppercase tracking-widest border border-zinc-200 dark:border-border-dark hover:border-cyan-600/30 dark:hover:border-violet-400/30 hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-500 dark:text-muted-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:focus-visible:ring-violet-400"
            >
              <ChevronLeft className="w-4 h-4 mr-2" aria-hidden="true" />
              Back to Order
            </Link>
          ) : (
            <>
              <Link
                href="/donate"
                className="group relative flex-1 overflow-hidden flex items-center justify-between px-6 py-3.5 text-sm uppercase tracking-widest text-white bg-cyan-600 hover:bg-cyan-500 dark:bg-violet-500 dark:hover:bg-violet-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-bg-dark"
              >
                <span
                  className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/15 to-transparent group-hover:animate-[shimmer_1.4s_ease_infinite] pointer-events-none"
                  aria-hidden="true"
                />
                <span>Donate Again</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link
                href={`/my-pack${myPackTab}`}
                className="flex-1 flex items-center justify-center px-6 py-3.5 text-sm uppercase tracking-widest border border-zinc-200 dark:border-border-dark hover:border-cyan-600/30 dark:hover:border-violet-400/30 hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-500 dark:text-muted-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:focus-visible:ring-violet-400"
              >
                My Pack
              </Link>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
