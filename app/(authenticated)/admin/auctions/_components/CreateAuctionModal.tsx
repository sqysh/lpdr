'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Gavel, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEscapeKey } from 'lib/hooks/useEscapeKey.hook'
import { FormField } from 'components/_primitives/FormField'
import { FormError } from 'components/_primitives/FormError'
import { createAuction } from 'lib/actions/admin/auction/createAuction'
import { AUCTION_HOUR_OPTIONS } from 'lib/utils/auction.utils'
import { createAuctionFormSchema, CreateAuctionFormValues } from 'lib/schemas/auction.schema'

const INFO_NOTE = 'Goal, custom auction link, and items can be configured after creation.'

const EMPTY: CreateAuctionFormValues = { title: '', startDate: '', endDate: '' }

/** Rebuilds an ISO string when either half of a date/time pair changes. */
const withDate = (iso: string, date: string, fallbackHour: string) => {
  const hour = iso ? iso.slice(11, 13) : fallbackHour
  return `${date}T${hour}:00:00`
}

const withHour = (iso: string, hour: string) => {
  const date = iso ? iso.slice(0, 10) : ''
  return `${date}T${hour.padStart(2, '0')}:00:00`
}

export function CreateAuctionModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<CreateAuctionFormValues>({
    resolver: zodResolver(createAuctionFormSchema),
    defaultValues: EMPTY
  })

  useEscapeKey(isOpen, onClose)

  const onSubmit = async (values: CreateAuctionFormValues) => {
    const result = await createAuction({
      title: values.title,
      startDate: new Date(values.startDate),
      endDate: new Date(values.endDate)
    })

    if (!result.success) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          setError(field as keyof CreateAuctionFormValues, { message: messages[0] })
        }
      }
      setError('root', { message: result.error })
      return
    }

    router.push(`/admin/auctions/${result.data.id}`)
    onClose()
    reset(EMPTY)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.form
            key="modal"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            role="dialog"
            aria-modal="true"
            aria-labelledby="auction-modal-title"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 top-1/2 -translate-y-1/2 z-50 w-auto sm:w-full sm:max-w-lg bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border-light dark:border-border-dark">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 flex items-center justify-center bg-primary-light/10 dark:bg-primary-dark/10">
                  <Gavel size={14} className="text-primary-light dark:text-primary-dark" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">Admin</p>
                  <h2
                    id="auction-modal-title"
                    className="text-sm font-quicksand font-black text-text-light dark:text-text-dark leading-snug"
                  >
                    New Auction
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="p-2 text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark border border-transparent hover:border-border-light dark:hover:border-border-dark transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6 space-y-4">
              <FormError error={errors.root?.message ?? null} />

              <FormField
                id="auction-title"
                label="Title"
                {...register('title')}
                placeholder="e.g. Spring 2026 Auction"
                error={errors.title?.message}
                required
              />

              {/* ── Start ── */}
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 xs:grid-cols-[1fr_140px] gap-3">
                    <FormField
                      id="auction-startDate-date"
                      label="Start Date"
                      name="startDateOnly"
                      type="date"
                      value={field.value ? field.value.slice(0, 10) : ''}
                      onChange={(e) => field.onChange(withDate(field.value, e.target.value, '06'))}
                      onBlur={field.onBlur}
                      error={errors.startDate?.message}
                      required
                    />
                    <FormField
                      id="auction-startDate-hour"
                      label="Start Time"
                      name="startDateHour"
                      type="select"
                      value={field.value ? String(Number(field.value.slice(11, 13))) : ''}
                      onChange={(e) => field.onChange(withHour(field.value, e.target.value))}
                      onBlur={field.onBlur}
                      required
                    >
                      <option value="">Select time</option>
                      {AUCTION_HOUR_OPTIONS.map((h) => (
                        <option key={h.value} value={h.value}>
                          {h.label}
                        </option>
                      ))}
                    </FormField>
                  </div>
                )}
              />

              {/* ── End ── */}
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 xs:grid-cols-[1fr_140px] gap-3">
                    <FormField
                      id="auction-endDate-date"
                      label="End Date"
                      name="endDateOnly"
                      type="date"
                      value={field.value ? field.value.slice(0, 10) : ''}
                      onChange={(e) => field.onChange(withDate(field.value, e.target.value, '18'))}
                      onBlur={field.onBlur}
                      error={errors.endDate?.message}
                      required
                    />
                    <FormField
                      id="auction-endDate-hour"
                      label="End Time"
                      name="endDateHour"
                      type="select"
                      value={field.value ? String(Number(field.value.slice(11, 13))) : ''}
                      onChange={(e) => field.onChange(withHour(field.value, e.target.value))}
                      onBlur={field.onBlur}
                      required
                    >
                      <option value="">Select time</option>
                      {AUCTION_HOUR_OPTIONS.map((h) => (
                        <option key={h.value} value={h.value}>
                          {h.label}
                        </option>
                      ))}
                    </FormField>
                  </div>
                )}
              />

              <div className="px-4 py-3 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
                <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark leading-relaxed">{INFO_NOTE}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border-light dark:border-border-dark flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark text-[10px] font-mono tracking-[0.2em] uppercase hover:text-text-light dark:hover:text-text-dark hover:border-primary-light/40 dark:hover:border-primary-dark/40 transition-colors duration-150 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark text-white text-[10px] font-mono tracking-[0.2em] uppercase transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" aria-hidden="true" /> Creating...
                  </>
                ) : (
                  <>
                    <Gavel size={13} aria-hidden="true" /> Create Auction
                  </>
                )}
              </button>
            </div>
          </motion.form>
        </>
      )}
    </AnimatePresence>
  )
}
