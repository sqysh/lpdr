'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import createNewsletter from 'lib/actions/public/newsletter/createNewsletter'
import { showToast } from 'lib/store/slices/toastSlice'
import { useAppDispatch } from 'lib/store/store'
import { EMAIL_REGEX } from 'lib/constants/regex.constants'

const CORE_GRADIENT = {
  background: 'linear-gradient(90deg, #0e7490, #0891b2, #06b6d4, #0891b2, #0e7490)',
  backgroundSize: '200% 100%',
  animation: 'stripScroll 4s linear infinite'
}

export function DrawerNewsletterForm({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const dispatch = useAppDispatch()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!EMAIL_REGEX.test(email)) {
      dispatch(
        showToast({
          message: 'Error, please try again',
          description: 'Please enter a valid email address.',
          type: 'error'
        })
      )
      return
    }
    setLoading(true)
    await createNewsletter(email)
    dispatch(
      showToast({
        message: 'Subscribed!',
        description: `You'll now receive rescue updates, events, and adoption news at ${email}.`,
        type: 'success'
      })
    )
    setEmail('')
    setLoading(false)
  }

  return (
    <div className="px-4 py-5">
      <p className="text-f10 uppercase tracking-[0.25em] text-muted-light dark:text-muted-dark mb-1">
        Stay Updated
      </p>
      <p className="font-lato text-xs text-muted-light dark:text-muted-dark mb-4 leading-relaxed">
        Subscribe to our newsletter for rescues, events, and adoption opportunities!
      </p>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          name="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3.5 py-2.5 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark placeholder:text-muted-light dark:placeholder:text-muted-dark font-lato text-sm focus:outline-none focus-visible:border-primary-light dark:focus-visible:border-primary-dark transition-colors"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 disabled:opacity-50 disabled:cursor-not-allowed text-white text-f10 uppercase tracking-[0.25em] transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          style={CORE_GRADIENT}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                aria-hidden="true"
              />
              Subscribing...
            </span>
          ) : (
            'Subscribe'
          )}
        </button>
      </form>
      <Link
        href="/newsletters"
        onClick={onClose}
        className="inline-flex items-center gap-2 mt-4 text-f10 uppercase tracking-[0.25em] text-primary-light dark:text-primary-dark hover:text-secondary-light dark:hover:text-secondary-dark transition-colors"
      >
        View Newsletters
        <motion.div animate={{ x: [0, 4, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </motion.div>
      </Link>
    </div>
  )
}
