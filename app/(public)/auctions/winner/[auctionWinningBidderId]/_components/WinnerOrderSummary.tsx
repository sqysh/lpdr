'use client'

import { motion } from 'framer-motion'
import { Package, Truck } from 'lucide-react'
import Image from 'next/image'
import { IAuctionWinningBidder } from 'types/_auction-winning-bidder'
import { fadeUp } from 'lib/constants/motion.constants'

type Props = {
  winningBidder: IAuctionWinningBidder
  total: number
  shipping: number
  processingFee: number
  finalAmount: number
}

export function WinnerOrderSummary({
  winningBidder,
  total,
  shipping,
  processingFee,
  finalAmount
}: Props) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      custom={6}
      className="lg:sticky lg:top-8"
    >
      <div className="border border-zinc-200 dark:border-border-dark">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-200 dark:border-border-dark">
          <div className="flex items-center gap-2">
            <Package
              className="w-3.5 h-3.5 text-zinc-400 dark:text-muted-dark/50"
              aria-hidden="true"
            />
            <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 dark:text-muted-dark">
              Order Summary
            </span>
          </div>
        </div>

        {/* Items */}
        <div className="divide-y divide-zinc-200 dark:divide-border-dark">
          {winningBidder.auctionItems.map((item) => {
            const photo = item.photos.find((p) => p.isPrimary) ?? item.photos[0]
            return (
              <div key={item.id} className="flex items-center gap-3 px-5 py-4">
                <div className="shrink-0 w-14 h-14 bg-zinc-200 dark:bg-white/5 overflow-hidden">
                  {photo ? (
                    <Image
                      src={photo.url}
                      alt={item.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-zinc-400 dark:text-muted-dark/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-wide text-zinc-950 dark:text-text-dark leading-snug truncate">
                    {item.name}
                  </p>
                  {item.requiresShipping && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Truck
                        className="w-3 h-3 text-zinc-400 dark:text-muted-dark/50 shrink-0"
                        aria-hidden="true"
                      />
                      <span className="font-lato text-[10px] text-zinc-400 dark:text-muted-dark/50">
                        {item.shippingCosts
                          ? `+$${item.shippingCosts.toLocaleString()} shipping`
                          : 'Ships separately'}
                      </span>
                    </div>
                  )}
                </div>
                <span className="shrink-0 text-sm tabular-nums text-zinc-950 dark:text-text-dark">
                  ${item.soldPrice.toLocaleString()}
                </span>
              </div>
            )
          })}
        </div>

        {/* Totals */}
        <div className="px-5 py-4 border-t border-zinc-200 dark:border-border-dark space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="font-lato text-xs text-zinc-500 dark:text-muted-dark">Items</span>
            <span className="text-xs tabular-nums text-zinc-950 dark:text-text-dark">
              ${total.toLocaleString()}
            </span>
          </div>
          {shipping > 0 && (
            <div className="flex justify-between items-center">
              <span className="font-lato text-xs text-zinc-500 dark:text-muted-dark">Shipping</span>
              <span className="text-xs tabular-nums text-zinc-950 dark:text-text-dark">
                ${shipping.toLocaleString()}
              </span>
            </div>
          )}
          {processingFee > 0 && (
            <div className="flex justify-between items-center">
              <span className="font-lato text-xs text-zinc-500 dark:text-muted-dark">
                Processing fee
              </span>
              <span className="text-xs tabular-nums text-zinc-950 dark:text-text-dark">
                ${processingFee.toLocaleString()}
              </span>
            </div>
          )}
          <div className="pt-3 border-t border-zinc-200 dark:border-border-dark flex justify-between items-center">
            <span className="text-xs uppercase tracking-wide text-zinc-950 dark:text-text-dark">
              Total due
            </span>
            <span className="text-xl tabular-nums text-cyan-600 dark:text-violet-400">
              ${finalAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
