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
  Repeat,
  FileSignature,
  Stethoscope,
  Cpu,
  CalendarClock
} from 'lucide-react'
import { fadeUp } from 'lib/constants/motion.constants'
import Picture from 'components/_common/Picture'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { ORDER_TYPE_CONFIG } from 'lib/constants/order.constants'
import { formatMoney } from 'lib/utils/currency.utils'
import { useSearchParams } from 'next/navigation'
import { useCartStore } from 'stores/cart.store'
import { useConfettiStore } from 'stores/confetti.store'
import { LinkBody } from 'components/_common/LinkBody'
import { LinkSpinner } from 'components/_common/LinkSpinner'
import { Line } from 'components/_primitives'

const headerLink =
  'flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-zinc-400 dark:text-muted-dark hover:text-cyan-600 dark:hover:text-violet-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:focus-visible:ring-violet-400'

const secondaryButton =
  'flex-1 flex items-center justify-center gap-2 px-6 py-3.5 text-sm uppercase tracking-widest border border-zinc-200 dark:border-border-dark hover:border-cyan-600/30 dark:hover:border-violet-400/30 hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-500 dark:text-muted-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:focus-visible:ring-violet-400'

const FREQUENCY = {
  MONTHLY: { label: 'Monthly', short: 'mo', every: 'every month' },
  YEARLY: { label: 'Yearly', short: 'yr', every: 'every year' }
} as const

// Drawn from the agreement's own terms (clauses 4, 6 and 10), so the adopter sees their first
// obligations here rather than having to find them in twenty clauses
const ADOPTION_NEXT_STEPS = [
  {
    icon: FileSignature,
    title: 'Your signed copy',
    body: 'Little Paws countersigns your agreement, then emails you a copy for your records.'
  },
  {
    icon: Cpu,
    title: 'Transfer the microchip within 30 days',
    body: 'Email chips@littlepawsdr.org and the rescue will transfer it to you at no cost.'
  },
  {
    icon: Stethoscope,
    title: 'See a vet within 30 days',
    body: 'Get settled into a vaccination and health plan with your own veterinarian.'
  },
  {
    icon: CalendarClock,
    title: 'Two-week trial period',
    body: "If things aren't working out, email applications@littlepawsdr.org within 14 days."
  }
]

const formatLongDate = (date: string | Date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

export default function OrderConfirmationClient({ order }) {
  const clearCart = useCartStore((s) => s.clearCart)
  const showConfetti = useConfettiStore((s) => s.show)
  const config = ORDER_TYPE_CONFIG[order?.type] ?? ORDER_TYPE_CONFIG['ONE_TIME_DONATION']
  const session = useSession()
  const searchParams = useSearchParams()

  const myPackTab = searchParams.get('tab')
  const ref = searchParams.get('ref')
  const isNewOrder = ref === 'new'
  const isAdminView = ref === 'admin'
  const myPackHref = myPackTab ? `/my-pack?tab=${myPackTab}` : '/my-pack'

  useEffect(() => {
    clearCart()
    if (isNewOrder) showConfetti()
  }, [clearCart, isNewOrder, showConfetti])

  const adoption = order?.type === 'ADOPTION_AGREEMENT' ? order?.adoptionAgreement : null
  const frequency = order?.isRecurring ? FREQUENCY[order?.recurringFrequency as keyof typeof FREQUENCY] : null
  const typeCode = frequency ? 'RD' : 'DN'

  const shipping = Number(order?.shipping ?? 0)
  const feesCovered = order?.coverFees ? Number(order?.feesCovered ?? 0) : 0
  // Recurring orders created before the invoice handler recorded a subtotal have 0 stored, so it is
  // derived from what was recorded rather than showing a $0.00 line above a real total
  const subtotal = Number(order?.subtotal) > 0 ? Number(order.subtotal) : Number(order?.totalAmount ?? 0) - feesCovered - shipping

  const headerNav = isAdminView
    ? { href: `/admin/transactions/${order.id}`, icon: <ChevronLeft className="w-3 h-3" aria-hidden="true" />, label: 'Back to Order' }
    : session?.data?.user
      ? { href: '/my-pack', icon: <User className="w-3 h-3" aria-hidden="true" />, label: 'My Pack' }
      : { href: '/', icon: <ChevronLeft className="w-3 h-3" aria-hidden="true" />, label: 'Home' }

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
        <div className="max-w-2xl mx-auto px-4 430:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-4 h-px bg-cyan-600 dark:bg-violet-400" aria-hidden="true" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-cyan-600 dark:text-violet-400">Little Paws Dachshund Rescue</span>
          </div>
          <Link href={headerNav.href} className={headerLink}>
            <LinkBody icon={headerNav.icon} label={headerNav.label} />
          </Link>
        </div>
      </motion.header>

      <div className="max-w-2xl mx-auto px-4 430:px-6 pt-24 430:pt-28 pb-12 430:pb-16">
        {/* ── Heading ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0} className="mb-10">
          <div className="flex items-start gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
              className="relative shrink-0"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-cyan-600/10 dark:bg-violet-400/10">
                <CheckCircle className="w-5 h-5 text-cyan-600 dark:text-violet-400" aria-hidden="true" />
              </div>
              <motion.div
                animate={{ scale: [0.8, 1.8, 0.8], opacity: [0.5, 0, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut', times: [0, 0.7, 1] }}
                className="absolute inset-0 bg-cyan-600/20 dark:bg-violet-400/20"
                aria-hidden="true"
              />
            </motion.div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-600 dark:text-violet-400 mb-1">{config.label}</p>
              <h1 className="text-3xl 430:text-4xl uppercase leading-none text-zinc-950 dark:text-text-dark mb-2">
                Thank you, {order?.customerName}!
              </h1>
              <p className="font-lato text-sm text-zinc-500 dark:text-muted-dark leading-relaxed max-w-lg">{config.message}</p>
            </div>
          </div>
        </motion.div>

        {/* ── The dog, for an adoption. It's the point of the page, so it comes before the receipt ── */}
        {adoption && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            custom={0.5}
            className="flex items-center gap-4 p-4 mb-6 border border-cyan-600/30 dark:border-violet-400/30 bg-cyan-600/5 dark:bg-violet-400/5"
          >
            <div className="w-20 h-20 shrink-0 overflow-hidden bg-zinc-100 dark:bg-white/5">
              {adoption.dogPhoto && <Picture src={adoption.dogPhoto} alt={adoption.dogName} className="w-full h-full object-cover" />}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-600 dark:text-violet-400 mb-1">Welcome home</p>
              <p className="text-lg text-zinc-950 dark:text-text-dark leading-snug">{adoption.dogName}</p>
              <p className="text-[10px] font-mono text-zinc-400 dark:text-muted-dark/60 mt-0.5">LPDR Rescue ID #{adoption.dogRescueId}</p>
            </div>
          </motion.div>
        )}

        {/* ── Receipt ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="border border-zinc-200 dark:border-border-dark mb-6"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-border-dark bg-zinc-50 dark:bg-white/2">
            <div className="flex items-center gap-2">
              <Receipt className="w-3.5 h-3.5 text-zinc-400 dark:text-muted-dark/50" aria-hidden="true" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 dark:text-muted-dark">Receipt</span>
            </div>
            <span className="text-[10px] uppercase tracking-tag text-zinc-400 dark:text-muted-dark/50 font-mono">
              #{order?.id.slice(-8).toUpperCase()}
            </span>
          </div>

          {/* Items: adoptions itemize from the agreement below, so they skip this block */}
          {!adoption &&
            (order?.items.length > 0 ? (
              <div className="divide-y divide-zinc-200 dark:divide-border-dark">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="flex items-start gap-3 min-w-0">
                      {item.image ? (
                        <Picture
                          src={item.image}
                          alt=""
                          className="w-11 h-11 object-cover border border-zinc-200 dark:border-border-dark shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 bg-zinc-50 dark:bg-white/5 flex items-center justify-center shrink-0" aria-hidden="true">
                          <Package className="w-4 h-4 text-zinc-300 dark:text-muted-dark" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm text-zinc-900 dark:text-white truncate">{item.itemName}</p>
                        {item.quantity > 1 && <p className="text-xs text-zinc-400 dark:text-muted-dark mt-0.5">Qty {item.quantity}</p>}
                        {item.size && <p className="text-xs text-zinc-400 dark:text-muted-dark mt-0.5">Size {item.size}</p>}
                      </div>
                    </div>
                    <p className="text-sm text-zinc-900 dark:text-white tabular-nums shrink-0">{formatMoney(item.price)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-4 px-5 py-4">
                <div className="shrink-0 w-10 h-10 border border-zinc-200 dark:border-border-dark flex items-center justify-center">
                  <span className="font-mono text-[10px] font-bold tracking-widest text-zinc-400 dark:text-muted-dark/50">{typeCode}</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-xs uppercase tracking-wide text-zinc-950 dark:text-text-dark">
                    {frequency ? `${frequency.label} Donation` : 'One-Time Donation'}
                  </p>
                  {order?.tierName && (
                    <p className="text-xs uppercase tracking-wide text-zinc-400 dark:text-muted-dark/50">{order.tierName}</p>
                  )}
                </div>
                {frequency && (
                  <span className="ml-auto shrink-0 inline-flex items-center gap-1.5 px-2 py-1 border border-cyan-600/30 dark:border-violet-400/30 text-[10px] font-mono uppercase tracking-wider text-cyan-600 dark:text-violet-400">
                    <Repeat className="w-3 h-3" aria-hidden="true" />
                    {frequency.label}
                  </span>
                )}
              </div>
            ))}

          {order?.donorMessage && (
            <div className="px-5 py-4 border-t border-zinc-200 dark:border-border-dark">
              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 dark:text-muted-dark/50 mb-2">Your message</p>
              <p className="font-lato text-sm text-zinc-700 dark:text-muted-dark leading-relaxed whitespace-pre-wrap wrap-break-word">
                {order.donorMessage}
              </p>
            </div>
          )}

          {/* Totals */}
          <div className={`px-5 py-4 space-y-2 ${adoption ? '' : 'border-t border-zinc-200 dark:border-border-dark'}`}>
            {adoption ? (
              <>
                <Line label="Adoption fee" value={formatMoney(Number(adoption.adoptionFee))} />
                {Number(adoption.healthCertificateFee ?? 0) > 0 && (
                  <Line label="Health certificate" value={formatMoney(Number(adoption.healthCertificateFee))} />
                )}
                {Number(adoption.additionalDonation ?? 0) > 0 && (
                  <Line label="Your additional donation" value={formatMoney(Number(adoption.additionalDonation))} accent />
                )}
              </>
            ) : (
              <>
                <Line label={frequency ? `${frequency.label} gift` : 'Subtotal'} value={formatMoney(subtotal)} />
                {shipping > 0 && <Line label="Shipping" value={formatMoney(shipping)} />}
              </>
            )}

            {feesCovered > 0 && <Line label="Processing fees covered" value={`+${formatMoney(feesCovered)}`} accent />}

            <div className="flex justify-between items-end pt-3 mt-1 border-t border-zinc-200 dark:border-border-dark">
              <span className="text-xs uppercase tracking-wide text-zinc-950 dark:text-text-dark">
                {frequency ? 'Charged today' : 'Total'}
              </span>
              <span className="text-2xl tabular-nums text-cyan-600 dark:text-violet-400">
                {formatMoney(order?.totalAmount)}
                {frequency && <span className="text-sm text-zinc-400 dark:text-muted-dark">/{frequency.short}</span>}
              </span>
            </div>

            {/* Says plainly that this repeats, since the receipt otherwise reads like a single charge */}
            {frequency && (
              <p className="font-lato text-xs text-zinc-500 dark:text-muted-dark pt-1">
                You&apos;ll be charged {formatMoney(order?.totalAmount)} {frequency.every} until you cancel. You can cancel anytime from My
                Pack.
              </p>
            )}
          </div>

          {/* Meta */}
          <div className="px-5 py-4 border-t border-zinc-200 dark:border-border-dark bg-zinc-50 dark:bg-white/2 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-lato text-[10px] text-zinc-400 dark:text-muted-dark/50">Email</span>
              <span className="font-lato text-[10px] text-zinc-600 dark:text-muted-dark truncate max-w-50">{order?.customerEmail}</span>
            </div>
            {order?.paidAt && (
              <div className="flex justify-between items-center">
                <span className="font-lato text-[10px] text-zinc-400 dark:text-muted-dark/50">Date</span>
                <span className="font-lato text-[10px] text-zinc-600 dark:text-muted-dark">{formatLongDate(order.paidAt)}</span>
              </div>
            )}
            {frequency && (
              <div className="flex justify-between items-center">
                <span className="font-lato text-[10px] text-zinc-400 dark:text-muted-dark/50">Billed</span>
                <span className="font-lato text-[10px] text-zinc-600 dark:text-muted-dark">{frequency.label}</span>
              </div>
            )}
            {frequency && order?.nextBillingDate && (
              <div className="flex justify-between items-center">
                <span className="font-lato text-[10px] text-zinc-400 dark:text-muted-dark/50">Next charge</span>
                <span className="font-lato text-[10px] text-zinc-600 dark:text-muted-dark">{formatLongDate(order.nextBillingDate)}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── What happens next, for an adoption ── */}
        {adoption && (
          <motion.section variants={fadeUp} initial="hidden" animate="show" custom={1.5} aria-labelledby="next-steps" className="mb-6">
            <h2 id="next-steps" className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 dark:text-muted-dark mb-3">
              What happens next
            </h2>
            <ol className="border border-zinc-200 dark:border-border-dark divide-y divide-zinc-200 dark:divide-border-dark">
              {ADOPTION_NEXT_STEPS.map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex items-start gap-3 px-5 py-4">
                  <Icon className="w-4 h-4 shrink-0 mt-0.5 text-cyan-600 dark:text-violet-400" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-zinc-900 dark:text-white">{title}</p>
                    <p className="font-lato text-xs text-zinc-500 dark:text-muted-dark leading-relaxed mt-0.5">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </motion.section>
        )}

        {/* ── Confirmation email note ── */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="flex items-start gap-3 px-4 py-3 mb-6 border-l-2 border-cyan-600 dark:border-violet-400 bg-cyan-600/5 dark:bg-violet-400/5"
          role="note"
        >
          <Heart className="w-3.5 h-3.5 text-cyan-600 dark:text-violet-400 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="font-lato text-xs text-zinc-500 dark:text-muted-dark leading-relaxed">
            A confirmation email has been sent to <strong className="text-zinc-950 dark:text-text-dark">{order?.customerEmail}</strong>
          </p>
        </motion.div>

        {/* ── Actions ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3} className="flex flex-col 430:flex-row gap-3">
          {isAdminView ? (
            <Link href={`/admin/transactions/${order.id}`} className={secondaryButton}>
              <ChevronLeft className="w-4 h-4 mr-2" aria-hidden="true" />
              Back to Order
            </Link>
          ) : (
            <>
              <Link
                href={adoption ? `/adopt/agreement/${adoption.id}` : '/'}
                className="group relative flex-1 overflow-hidden flex items-center justify-between px-6 py-3.5 text-sm uppercase tracking-widest text-white bg-cyan-600 hover:bg-cyan-500 dark:bg-violet-500 dark:hover:bg-violet-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-bg-dark"
              >
                <span
                  className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/15 to-transparent group-hover:animate-[shimmer_1.4s_ease_infinite] pointer-events-none"
                  aria-hidden="true"
                />
                <span className="w-fit flex items-center space-x-2">
                  <LinkBody icon={null} label={adoption ? 'View your agreement' : 'Back to site'} spinnerClass="w-4 h-4" />
                </span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>

              <Link href={myPackHref} className={secondaryButton}>
                <LinkSpinner label="My Pack" spinnerClass="w-4 h-4" />
              </Link>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
