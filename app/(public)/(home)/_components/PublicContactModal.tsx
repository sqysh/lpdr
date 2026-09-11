'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Send } from 'lucide-react'
import { useEffect, useState } from 'react'
import sendContactEmail from 'lib/email/sendContactEmail'
import { FormField } from 'components/_primitives/FormField'
import { FormError } from 'components/_primitives/FormError'
import { useModalsStore } from 'stores/modals.store'
import { useEscapeKey } from 'lib/hooks/useEscapeKey.hook'
import { contactSchema, ContactFormValues, EMPTY_CONTACT, ContactFormInput } from 'lib/schemas/contact.schema'

export default function PublicContactModal() {
  const closeContact = useModalsStore((s) => s.closeContact)
  const contactOpen = useModalsStore((s) => s.contactOpen)

  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormInput, unknown, ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: EMPTY_CONTACT
  })

  useEscapeKey(contactOpen, closeContact)

  // Stamped when the modal opens rather than on mount, since the page may have
  // been sitting open for a while before anyone clicked Contact
  useEffect(() => {
    if (contactOpen) setValue('renderedAt', Date.now())
  }, [contactOpen, setValue])

  const handleClose = () => {
    closeContact()
    reset(EMPTY_CONTACT)
    setSuccess(false)
  }

  const onSubmit = async (values: ContactFormValues) => {
    const result = await sendContactEmail(values)

    if (!result.success) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          setError(field as keyof ContactFormInput, { message: messages[0] })
        }
      }
      setError('root', { message: result.error ?? 'Something went wrong. Please try again.' })
      return
    }

    reset(EMPTY_CONTACT)
    setSuccess(true)
  }

  return (
    <AnimatePresence>
      {contactOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-110 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden="true"
          />

          <motion.div
            key="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-4 xs:inset-x-6 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 top-1/2 -translate-y-1/2 z-120 w-auto sm:w-full sm:max-w-lg bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-light dark:border-border-dark">
              <div className="flex items-center gap-3">
                <span className="block w-5 h-px bg-primary-light dark:bg-primary-dark shrink-0" aria-hidden="true" />
                <h2
                  id="contact-modal-title"
                  className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark"
                >
                  Contact Us
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close contact modal"
                className="text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>

            {/* Success */}
            {success ? (
              <div className="px-5 py-12 text-center space-y-2">
                <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
                  Message Sent
                </p>
                <p className="text-sm font-mono text-muted-light dark:text-muted-dark">
                  Thanks for reaching out. We&apos;ll get back to you as soon as we can.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-[10px] font-mono tracking-[0.2em] uppercase bg-primary-light dark:bg-primary-dark text-white dark:text-bg-dark hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="relative px-5 py-6 space-y-4">
                  {/* Hidden from people, filled in by bots */}
                  <input
                    type="text"
                    {...register('website')}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="absolute w-px h-px overflow-hidden -left-96"
                  />

                  <FormError error={errors.root?.message ?? null} />

                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                    <FormField
                      id="contact-name"
                      label="Name"
                      {...register('name')}
                      placeholder="Jane Smith"
                      autoComplete="name"
                      error={errors.name?.message}
                      required
                    />
                    <FormField
                      id="contact-email"
                      label="Email"
                      type="email"
                      {...register('email')}
                      placeholder="jane@example.com"
                      autoComplete="email"
                      error={errors.email?.message}
                      required
                    />
                  </div>

                  <FormField
                    id="contact-subject"
                    label="Subject"
                    {...register('subject')}
                    placeholder="How can we help?"
                    error={errors.subject?.message}
                    required
                  />

                  <FormField
                    id="contact-message"
                    label="Message"
                    type="textarea"
                    rows={5}
                    {...register('message')}
                    placeholder="Tell us what's on your mind..."
                    error={errors.message?.message}
                    required
                  />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border-light dark:border-border-dark">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark border border-border-light dark:border-border-dark hover:text-text-light dark:hover:text-text-dark hover:border-text-light dark:hover:border-text-dark transition-colors duration-200 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light dark:bg-primary-dark text-[10px] font-mono tracking-[0.2em] uppercase text-white dark:text-bg-dark hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting && <Loader2 size={11} className="animate-spin" aria-hidden="true" />}
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                    {!isSubmitting && <Send size={11} aria-hidden="true" />}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
