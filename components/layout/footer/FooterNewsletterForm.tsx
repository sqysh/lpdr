import { useStatusMessage } from '@hooks/useStatusMessage.hook'
import { useForm } from 'react-hook-form'
import { EMPTY_NEWSLETTER, NewsletterFormInput, NewsletterFormValues, newsletterSchema } from 'lib/schemas/newsletter.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import createNewsletter from 'lib/actions/public/newsletter/createNewsletter'
import { useEffect } from 'react'

export function FooterNewsletterForm() {
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
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Newsletter signup" className="relative space-y-2.5">
      <input
        type="text"
        {...register('website')}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute w-px h-px overflow-hidden -left-96"
      />
      <div>
        <label htmlFor="footer-email" className="sr-only">
          Your email address
        </label>
        <input
          id="footer-email"
          type="email"
          autoComplete="email"
          placeholder="your@email.com"
          aria-invalid={!!errors.email}
          {...register('email')}
          aria-describedby={status ? 'newsletter-status' : undefined}
          className="w-full bg-white/5 border border-white/10 px-3.5 py-2.5 text-base sm:text-sm font-mono text-white placeholder:text-on-dark focus:outline-none focus:border-primary-light dark:focus:border-primary-dark transition-colors"
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
        className="w-full py-2.5 px-4 text-[10px] font-mono tracking-eyebrow uppercase border border-primary-light dark:border-primary-dark text-white hover:bg-primary-light/10 dark:hover:bg-primary-dark/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Subscribing...' : 'Subscribe'}
      </button>

      {status && (
        <p
          id="newsletter-status"
          role={status.tone === 'error' ? 'alert' : 'status'}
          className={`text-[10px] font-mono tracking-widest ${
            status.tone === 'error' ? 'text-red-400' : 'text-primary-light dark:text-primary-dark'
          }`}
        >
          {status.message}
        </p>
      )}
    </form>
  )
}
