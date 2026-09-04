'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { X, FileText } from 'lucide-react'
import { MONTHS, YEARS, CURRENT_YEAR } from 'lib/constants/date.constants'
import {
  fieldLabel,
  fieldBase,
  fieldInput,
  focusRing,
  buttonPrimary,
  buttonSecondary
} from 'lib/constants/form.styles.constants'
import createNewsletterIssue from 'lib/actions/admin/newsletter-issue/createNewsletterIssue'
import { useEscapeKey } from 'lib/hooks/useEscapeKey.hook'
import { FormState } from 'types/newsletter-issue.types'
import { Toggle, FormError } from 'components/_primitives'

const modalShell =
  'relative w-full max-w-md bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark flex flex-col max-h-[90vh]'

const modalBar = 'px-5 py-4 border-border-light dark:border-border-dark'

const modalTitle =
  'font-mono text-[11px] tracking-[0.2em] uppercase text-text-light dark:text-text-dark'

const closeButton = `p-1 text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors ${focusRing}`

const previewLink = `inline-flex items-center gap-1.5 mt-2 text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark hover:underline`

const initialState = (): FormState => ({
  month: MONTHS[new Date().getMonth()],
  year: String(CURRENT_YEAR),
  pdfUrl: '',
  isLive: false
})

export function NewsletterIssueModal({
  isOpen,
  onClose,
  onCreated
}: {
  isOpen: boolean
  onClose: () => void
  onCreated: (issue: { month: string; year: string; isLive: boolean }) => void
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

    onCreated({ month: form.month, year: form.year, isLive: form.isLive })
    router.refresh()
    setLoading(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ni-modal-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={modalShell}
          >
            <div className={`${modalBar} border-b flex items-center justify-between`}>
              <h2 id="ni-modal-title" className={modalTitle}>
                New issue
              </h2>
              <button type="button" onClick={onClose} aria-label="Close" className={closeButton}>
                <X size={16} aria-hidden="true" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ni-month" className={fieldLabel}>
                    Month
                  </label>
                  <select
                    id="ni-month"
                    value={form.month}
                    onChange={(e) => update('month', e.target.value)}
                    className={fieldBase}
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="ni-year" className={fieldLabel}>
                    Year
                  </label>
                  <select
                    id="ni-year"
                    value={form.year}
                    onChange={(e) => update('year', e.target.value)}
                    className={fieldBase}
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="ni-pdfUrl" className={fieldLabel}>
                  PDF URL
                </label>
                <input
                  id="ni-pdfUrl"
                  type="url"
                  inputMode="url"
                  value={form.pdfUrl}
                  onChange={(e) => update('pdfUrl', e.target.value)}
                  placeholder="https://..."
                  className={fieldInput}
                />
                {form.pdfUrl && (
                  <a
                    href={form.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={previewLink}
                  >
                    <FileText size={12} aria-hidden="true" />
                    Preview PDF
                  </a>
                )}
              </div>

              <Toggle
                id="ni-isLive"
                label="Live"
                description="Visible to the public on the newsletters page"
                checked={form.isLive}
                onToggle={() => update('isLive', !form.isLive)}
              />

              <FormError error={error} />
            </div>

            <div className={`${modalBar} border-t flex items-center gap-3`}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className={buttonSecondary}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className={buttonPrimary}
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
