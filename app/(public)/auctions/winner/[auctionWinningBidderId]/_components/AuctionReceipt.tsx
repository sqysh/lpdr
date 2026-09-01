'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft, Heart, Package } from 'lucide-react'

type AuctionItem = {
  id: string
  name: string
  soldPrice: number
}

type WinningBidder = {
  paidOn?: Date | string | null
  auction?: { title: string }
  auctionItems?: AuctionItem[]
  shipping?: number | null
  processingFee?: number | null
  totalPrice?: number | null
  user: { firstName: string } | null
}

type WinnerReceiptProps = {
  winningBidder: WinningBidder
}

export function AuctionReceipt({ winningBidder }: WinnerReceiptProps) {
  const itemsTotal = winningBidder.auctionItems.reduce((sum, item) => sum + item.soldPrice, 0)

  return (
    <div className="min-h-dvh bg-white dark:bg-bg-dark flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        {/* Receipt header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-4 h-px bg-cyan-600 dark:bg-violet-400" />
            <span className="  text-[10px] uppercase tracking-[0.25em] text-cyan-600 dark:text-violet-400">
              Receipt
            </span>
            <div className="w-4 h-px bg-cyan-600 dark:bg-violet-400" />
          </div>
          <h1 className="  text-2xl uppercase text-zinc-950 dark:text-text-dark mb-1">Payment Confirmed</h1>
          <p className="font-lato text-xs text-zinc-400 dark:text-muted-dark">
            {winningBidder.paidOn
              ? new Date(winningBidder.paidOn).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })
              : '—'}
          </p>
        </div>

        {/* Receipt body */}
        <div className="border border-zinc-200 dark:border-border-dark">
          {/* Auction */}
          <div className="px-5 py-3 border-b border-zinc-200 dark:border-border-dark bg-zinc-50 dark:bg-white/2">
            <p className="  text-[10px] uppercase tracking-[0.25em] text-zinc-500 dark:text-muted-dark">
              {winningBidder.auction.title}
            </p>
          </div>

          {/* Items */}
          <div className="divide-y divide-zinc-200 dark:divide-border-dark">
            {winningBidder.auctionItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="flex items-center gap-3 min-w-0">
                  <Package className="w-3.5 h-3.5 text-zinc-400 dark:text-muted-dark/50 shrink-0" aria-hidden="true" />
                  <p className="font-lato text-sm text-zinc-950 dark:text-text-dark truncate">{item.name}</p>
                </div>
                <span className="  text-sm tabular-nums text-zinc-950 dark:text-text-dark shrink-0">
                  ${item.soldPrice.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="px-5 py-4 border-t border-zinc-200 dark:border-border-dark space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-lato text-xs text-zinc-500 dark:text-muted-dark">Items</span>
              <span className="  text-xs tabular-nums text-zinc-950 dark:text-text-dark">
                ${itemsTotal.toLocaleString()}
              </span>
            </div>
            {(winningBidder.shipping ?? 0) > 0 && (
              <div className="flex justify-between items-center">
                <span className="font-lato text-xs text-zinc-500 dark:text-muted-dark">Shipping</span>
                <span className="  text-xs tabular-nums text-zinc-950 dark:text-text-dark">
                  ${Number(winningBidder.shipping).toLocaleString()}
                </span>
              </div>
            )}
            {(winningBidder.processingFee ?? 0) > 0 && (
              <div className="flex justify-between items-center">
                <span className="font-lato text-xs text-zinc-500 dark:text-muted-dark">Processing fee</span>
                <span className="  text-xs tabular-nums text-zinc-950 dark:text-text-dark">
                  ${Number(winningBidder.processingFee).toLocaleString()}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-zinc-200 dark:border-border-dark flex justify-between items-center">
              <span className="  text-xs uppercase tracking-wide text-zinc-950 dark:text-text-dark">Total Paid</span>
              <span className="  text-xl tabular-nums text-cyan-600 dark:text-violet-400">
                ${Number(winningBidder.totalPrice ?? 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Thank you */}
          <div className="px-5 py-4 border-t border-zinc-200 dark:border-border-dark bg-zinc-50 dark:bg-white/2 flex items-start gap-3">
            <Heart className="w-3.5 h-3.5 text-cyan-600 dark:text-violet-400 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="font-lato text-xs text-zinc-500 dark:text-muted-dark leading-relaxed">
              Thank you for supporting Little Paws Dachshund Rescue, {winningBidder.user?.firstName}. Your generosity
              helps the dogs in our care find their forever homes.
            </p>
          </div>
        </div>

        {/* Back to account */}
        <div className="mt-6 text-center">
          <Link
            href=" /my-pack"
            className="inline-flex items-center gap-1.5   text-[10px] uppercase tracking-[0.25em] text-zinc-400 dark:text-muted-dark hover:text-cyan-600 dark:hover:text-violet-400 transition-colors"
          >
            <ChevronLeft className="w-3 h-3" aria-hidden="true" />
            Back to My Account
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
