'use client'

import { X, Loader2, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { setCloseContactModal } from 'lib/store/slices/uiSlice'
import { store, useUiSelector } from 'lib/store/store'
import sendContactEmail from 'lib/email/sendContactEmail'
import { EMAIL_REGEX } from 'lib/constants/regex.constants'
import { FormField } from 'components/_primitives'

interface FormInputs {
  name: string
  email: string
  subject: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
  form?: string
}

const EMPTY: FormInputs = { name: '', email: '', subject: '', message: '' }

function validate(inputs: FormInputs): FormErrors {
  const errs: FormErrors = {}
  if (!inputs.name.trim()) errs.name = 'Name is required'
  if (!EMAIL_REGEX.test(inputs.email.trim())) errs.email = 'Email is required'
  if (!inputs.subject.trim()) errs.subject = 'Subject is required'
  if (!inputs.message.trim()) errs.message = 'Message is required'
  return errs
}

export default function PublicContactModal() {
  const { contactModal } = useUiSelector()

  const [inputs, setInputs] = useState<FormInputs>(EMPTY)
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const patch = (data: Partial<FormInputs>) => setInputs((prev) => ({ ...prev, ...data }))

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    patch({ [e.target.name]: e.target.value } as Partial<FormInputs>)

  const handleClose = () => {
    store.dispatch(setCloseContactModal())
    setInputs(EMPTY)
    setErrors({})
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const errs = validate(inputs)
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setLoading(true)
    setErrors({})

    const result = await sendContactEmail(inputs)

    setLoading(false)

    if (!result.success) {
      setErrors({ form: 'Something went wrong. Please try again.' })
      return
    }

    setInputs(EMPTY)
    setSuccess(true)
  }

  return (
    <AnimatePresence>
      {contactModal && (
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
                <span
                  className="block w-5 h-px bg-primary-light dark:bg-primary-dark shrink-0"
                  aria-hidden="true"
                />
                <h2
                  id="contact-modal-title"
                  className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark"
                >
                  Contact Us
                </h2>
              </div>
              <button
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
                  onClick={handleClose}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-[10px] font-mono tracking-[0.2em] uppercase bg-primary-light dark:bg-primary-dark text-white dark:text-bg-dark hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="px-5 py-6 space-y-4">
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                    <FormField
                      id="contact-name"
                      label="Name"
                      name="name"
                      value={inputs.name}
                      onChange={handleInput}
                      placeholder="Jane Smith"
                      autoComplete="name"
                      error={errors.name}
                      required
                    />
                    <FormField
                      id="contact-email"
                      label="Email"
                      name="email"
                      type="email"
                      value={inputs.email}
                      onChange={handleInput}
                      placeholder="jane@example.com"
                      autoComplete="email"
                      error={errors.email}
                      required
                    />
                  </div>

                  <FormField
                    id="contact-subject"
                    label="Subject"
                    name="subject"
                    value={inputs.subject}
                    onChange={handleInput}
                    placeholder="How can we help?"
                    error={errors.subject}
                    required
                  />

                  <FormField
                    id="contact-message"
                    label="Message"
                    name="message"
                    type="textarea"
                    value={inputs.message}
                    onChange={handleInput}
                    placeholder="Tell us what's on your mind..."
                    rows={5}
                    error={errors.message}
                    required
                  />

                  {errors.form && (
                    <p
                      role="alert"
                      className="text-[10px] font-mono tracking-widest text-red-500 dark:text-red-400"
                    >
                      {errors.form}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border-light dark:border-border-dark">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark border border-border-light dark:border-border-dark hover:text-text-light dark:hover:text-text-dark hover:border-text-light dark:hover:border-text-dark transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light dark:bg-primary-dark text-[10px] font-mono tracking-[0.2em] uppercase text-white dark:text-bg-dark hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading && <Loader2 size={11} className="animate-spin" aria-hidden="true" />}
                    {loading ? 'Sending...' : 'Send Message'}
                    {!loading && <Send size={11} aria-hidden="true" />}
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
