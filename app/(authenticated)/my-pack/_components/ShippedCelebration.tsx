'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Package } from 'lucide-react'
import Link from 'next/link'

type Props = {
  orderId: string
  onClose: () => void
}

export function ShippedCelebration({ orderId, onClose }: Props) {
  const [countdown, setCountdown] = useState(8)

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setTimeout(onClose, 0) // ← defer to next tick
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-200 flex items-center justify-center px-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="shipped-title"
      aria-describedby="shipped-desc"
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-bg-dark/90 dark:bg-bg-dark/95"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <motion.div
        className="relative z-10 w-full max-w-sm bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark overflow-hidden"
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.1 }}
      >
        {/* Top drain bar */}
        <motion.div
          className="h-1 bg-primary-light dark:bg-primary-dark"
          initial={{ scaleX: 1, originX: 0 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: 8, ease: 'linear' }}
          aria-hidden="true"
        />

        <div className="px-6 py-8 text-center">
          {/* Icon */}
          <motion.div
            className="w-16 h-16 mx-auto mb-5 bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-light/30 dark:border-primary-dark/30 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            <Package className="w-7 h-7 text-primary-light dark:text-primary-dark" />
          </motion.div>

          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="block w-5 h-px bg-primary-light dark:bg-primary-dark" aria-hidden="true" />
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">Great news</p>
            <span className="block w-5 h-px bg-primary-light dark:bg-primary-dark" aria-hidden="true" />
          </div>

          <h2 id="shipped-title" className="font-quicksand font-black text-3xl text-text-light dark:text-text-dark mb-3 leading-tight">
            Your order
            <br />
            <span className="font-light text-muted-light dark:text-muted-dark">is on its way!</span>
          </h2>

          <p id="shipped-desc" className="text-sm text-muted-light dark:text-muted-dark leading-relaxed mb-6">
            Little Paws has shipped your order. Keep an eye on your email for tracking info.
          </p>

          <div className="space-y-2">
            <Link
              href={`/order-confirmation/${orderId}`}
              onClick={onClose}
              className="block w-full py-3.5 text-[10px] font-mono tracking-[0.2em] uppercase bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark text-white transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              View Order
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="block w-full py-3 text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors focus:outline-none focus-visible:underline"
            >
              Dismiss · {countdown}s
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
