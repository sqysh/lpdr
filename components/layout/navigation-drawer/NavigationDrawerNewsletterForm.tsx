'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import createNewsletter from 'lib/actions/public/newsletter/createNewsletter'
import { StatusMessage } from 'components/_primitives/StatusMessage'
import { useStatusMessage } from 'lib/hooks/useStatusMessage.hook'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { EMPTY_NEWSLETTER, NewsletterFormInput, NewsletterFormValues, newsletterSchema } from 'lib/schemas/newsletter.schema'

const CORE_GRADIENT = {
  background: 'linear-gradient(90deg, #0e7490, #0891b2, #06b6d4, #0891b2, #0e7490)',
  backgroundSize: '200% 100%',
  animation: 'stripScroll 4s linear infinite'
}

export function NavigationDrawerNewsletterForm({ onClose }: { onClose: () => void }) {
  const { status, flash, clearStatus } = useStatusMessage()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<NewsletterFormInput, unknown, NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: EMPTY_NEWSLETTER
  })

  useEffect(() => {
    setValue('renderedAt', Date.now())
  }, [setValue])

  const onSubmit = async (values: NewsletterFormValues) => {
    clearStatus()

    const result = await createNewsletter(values)

    if (!result.success) {
      flash({ tone: 'error', message: result.error ?? 'Something went wrong. Please try again.' })
      return
    }

    flash({
      tone: 'success',
      message: `Subscribed! You'll get rescue updates, events, and adoption news at ${values.email}.`
    })
    reset(EMPTY_NEWSLETTER)
  }

  return (
    <div className="px-4 py-5">
      <p className="text-f10 uppercase tracking-[0.25em] text-muted-light dark:text-muted-dark mb-1">Stay Updated</p>
      <p className="font-lato text-xs text-muted-light dark:text-muted-dark mb-4 leading-relaxed">
        Subscribe to our newsletter for rescues, events, and adoption opportunities!
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative space-y-2">
        <input
          type="text"
          {...register('website')}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute w-px h-px overflow-hidden -left-96"
        />
        <div>
          <label htmlFor="drawer-newsletter-email" className="sr-only">
            Your email address
          </label>
          <input
            id="drawer-newsletter-email"
            type="email"
            autoComplete="email"
            placeholder="your@email.com"
            aria-invalid={!!errors.email}
            {...register('email')}
            aria-describedby={status ? 'newsletter-status' : undefined}
            className="w-full px-3.5 py-2.5 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark placeholder:text-muted-light dark:placeholder:text-muted-dark font-lato text-sm focus:outline-none focus-visible:border-primary-light dark:focus-visible:border-primary-dark transition-colors"
          />
          {errors.email && (
            <p role="alert" className="text-[10px] font-mono text-red-500 dark:text-red-400 mt-1">
              {errors.email.message}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 disabled:opacity-50 disabled:cursor-not-allowed text-white text-f10 uppercase tracking-[0.25em] transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          style={CORE_GRADIENT}
        >
          {isSubmitting ? (
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

      <div className="mt-3">
        <StatusMessage status={status} />
      </div>

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
