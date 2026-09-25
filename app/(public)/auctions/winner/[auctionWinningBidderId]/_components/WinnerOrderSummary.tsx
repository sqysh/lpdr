'use client'

import { motion } from 'framer-motion'
import { Package, Truck } from 'lucide-react'
import Image from 'next/image'
import { fadeUp } from 'lib/constants/motion.constants'
import { formatMoney } from 'lib/utils/currency.utils'
import { IAuctionWinningBidder } from 'types/auction.types'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <dt className="font-lato text-xs text-zinc-500 dark:text-muted-dark">{label}</dt>
      <dd className="text-xs tabular-nums text-zinc-950 dark:text-text-dark">{value}</dd>
    </div>
  )
}

export function WinnerOrderSummary({
  winningBidder,
  total,
  shipping,
  processingFee,
  finalAmount,
  coverFees
}: {
  winningBidder: IAuctionWinningBidder
  total: number
  shipping: number
  processingFee: number
  finalAmount: number
  coverFees: boolean
}) {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="show"
      custom={6}
      aria-labelledby="winner-summary-heading"
      className="lg:sticky lg:top-8 border border-zinc-200 dark:border-border-dark"
    >
      <div className="px-5 py-4 border-b border-zinc-200 dark:border-border-dark flex items-center gap-2">
        <Package className="w-3.5 h-3.5 text-zinc-400 dark:text-muted-dark/50" aria-hidden="true" />
        <h2 id="winner-summary-heading" className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 dark:text-muted-dark">
          Order summary
        </h2>
      </div>

      <ul role="list" className="divide-y divide-zinc-200 dark:divide-border-dark">
        {winningBidder.auctionItems.map((item) => {
          const photo = item.photos.find((p) => p.isPrimary) ?? item.photos[0]
          const shippingCost = Number(item.shippingCosts ?? 0)

          return (
            <li key={item.id} className="flex items-center gap-3 px-5 py-4">
              <div className="shrink-0 w-14 h-14 bg-zinc-200 dark:bg-white/5 overflow-hidden" aria-hidden="true">
                {photo ? (
                  // The name is printed right beside it, so the photo needs no text of its own
                  <Image src={photo.url} alt="" width={56} height={56} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-zinc-400 dark:text-muted-dark/30" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-wide text-zinc-950 dark:text-text-dark leading-snug truncate">{item.name}</p>
                {item.requiresShipping && (
                  <p className="flex items-center gap-1 mt-0.5 font-lato text-[11px] text-zinc-500 dark:text-muted-dark">
                    <Truck className="w-3 h-3 shrink-0" aria-hidden="true" />
                    {shippingCost > 0 ? `+${formatMoney(shippingCost)} shipping` : 'Ships separately'}
                  </p>
                )}
              </div>

              <span className="shrink-0 text-sm tabular-nums text-zinc-950 dark:text-text-dark">
                {formatMoney(Number(item.soldPrice ?? 0))}
              </span>
            </li>
          )
        })}
      </ul>

      <dl className="px-5 py-4 border-t border-zinc-200 dark:border-border-dark space-y-2.5">
        <Row label="Items" value={formatMoney(total)} />
        {shipping > 0 && <Row label="Shipping" value={formatMoney(shipping)} />}
        {coverFees && processingFee > 0 && <Row label="Processing fees covered" value={`+${formatMoney(processingFee)}`} />}

        <div className="pt-3 border-t border-zinc-200 dark:border-border-dark flex justify-between items-center gap-4">
          <dt className="text-xs uppercase tracking-wide text-zinc-950 dark:text-text-dark">Total due</dt>
          <dd className="text-xl tabular-nums text-cyan-600 dark:text-violet-400">{formatMoney(finalAmount)}</dd>
        </div>
      </dl>
    </motion.section>
  )
}
