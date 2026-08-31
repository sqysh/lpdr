'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { X, FileText } from 'lucide-react'
import { store } from 'lib/store/store'
import { showToast } from 'lib/store/slices/toastSlice'
import { MONTHS, YEARS, CURRENT_YEAR } from 'lib/constants/date.constants'
import createNewsletterIssue from 'lib/actions/admin/newsletter-issue/createNewsletterIssue'
import { useEscapeKey } from 'lib/hooks/useEscapeKey.hook'
import { FormState } from 'types/_newsletter-issue.types'
import { Toggle } from 'app/components/_primitives'

const initialState = (): FormState => ({
  month: MONTHS[new Date().getMonth()],
  year: String(CURRENT_YEAR),
  pdfUrl: '',
  isLive: false
})

export function NewsletterIssueModal({
  isOpen,
  onClose
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const router = useRouter()

  const [form, setForm] = useState<FormState>(initialState)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  useEscapeKey(isOpen, onClose)

  const handleSave = async () => {
    if (!form.month || !form.year) {
      setError('Month and year are required')
      return
    }
    if (!form.pdfUrl.trim()) {
      setError('A PDF URL is required')
      return
    }

    setLoading(true)
    setError(null)

    const result = await createNewsletterIssue({
      month: form.month,
      year: form.year,
      pdfUrl: form.pdfUrl.trim(),
      isLive: form.isLive
    })

    if (!result.success) {
      setError(result.error ?? 'Something went wrong.')
      setLoading(false)
      return
    }

    store.dispatch(
      showToast({
        type: 'success',
        message: `${form.month} ${form.year} added`,
        description: form.isLive ? 'Live' : 'Draft'
      })
    )

    router.refresh()
    setLoading(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50"
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ni-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full max-w-md bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-light dark:border-border-dark">
              <h2
                id="ni-modal-title"
                className="font-mono text-[11px] tracking-[0.2em] uppercase text-text-light dark:text-text-dark"
              >
                New issue
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="p-1 text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {/* Month + Year */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="ni-month"
                    className="block font-mono text-[10px] tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-1.5"
                  >
                    Month
                  </label>
                  <select
                    id="ni-month"
                    value={form.month}
                    onChange={(e) => update('month', e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark focus:outline-none focus-visible:border-primary-light dark:focus-visible:border-primary-dark"
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="ni-year"
                    className="block font-mono text-[10px] tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-1.5"
                  >
                    Year
                  </label>
                  <select
                    id="ni-year"
                    value={form.year}
                    onChange={(e) => update('year', e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark focus:outline-none focus-visible:border-primary-light dark:focus-visible:border-primary-dark"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PDF URL */}
              <div>
                <label
                  htmlFor="ni-pdfUrl"
                  className="block font-mono text-[10px] tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-1.5"
                >
                  PDF URL
                </label>
                <input
                  id="ni-pdfUrl"
                  type="url"
                  inputMode="url"
                  value={form.pdfUrl}
                  onChange={(e) => update('pdfUrl', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-sm font-mono border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark placeholder:text-muted-light/50 dark:placeholder:text-muted-dark/50 focus:outline-none focus-visible:border-primary-light dark:focus-visible:border-primary-dark"
                />
                {form.pdfUrl && (
                  <a
                    href={form.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark hover:underline"
                  >
                    <FileText size={12} aria-hidden="true" />
                    Preview PDF
                  </a>
                )}
              </div>

              {/* Live toggle */}
              <Toggle
                id="ni-isLive"
                label="Live"
                description="Visible to the public on the newsletters page"
                checked={form.isLive}
                onToggle={() => update('isLive', !form.isLive)}
              />

              {error && (
                <p role="alert" className="font-mono text-[11px] text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border-light dark:border-border-dark flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-[10px] font-mono tracking-[0.2em] uppercase border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="flex-1 px-4 py-2 text-[10px] font-mono tracking-[0.2em] uppercase bg-primary-light dark:bg-primary-dark text-white dark:text-bg-dark hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                {loading ? 'Saving...' : 'Add issue'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
