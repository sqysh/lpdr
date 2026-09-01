import { updateAddress } from 'lib/actions/my-pack/updateAddress'
import { STATES } from 'lib/constants/location.constants'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle, Loader2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { IAddress } from 'types/_address.types'

export function UpdateAddressModal({
  open,
  onClose,
  address
}: {
  open: boolean
  onClose: () => void
  address: IAddress | null
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [name, setName] = useState(address?.name ?? '')
  const [addressLine1, setAddressLine1] = useState(address?.addressLine1 ?? '')
  const [addressLine2, setAddressLine2] = useState(address?.addressLine2 ?? '')
  const [city, setCity] = useState(address?.city ?? '')
  const [state, setState] = useState(address?.state ?? '')
  const [zipPostalCode, setZipPostalCode] = useState(address?.zipPostalCode ?? '')

  const handleSubmit = async () => {
    if (!name.trim() || !addressLine1.trim() || !city.trim() || !state || !zipPostalCode.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      const result = await updateAddress({
        name: name.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim() || null,
        city: city.trim(),
        state,
        zipPostalCode: zipPostalCode.trim(),
        country: 'US'
      })
      if (!result.success) {
        setError(result.error ?? 'Failed to update address.')
        return
      }
      setSuccess(true)
      router.refresh()
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 1200)
    } catch {
      setError('Failed to update address. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass =
    'w-full px-3.5 py-2.5 border-l-2 border-l-cyan-600 dark:border-l-violet-400 border-t border-r border-b border-zinc-200 dark:border-border-dark bg-zinc-50 dark:bg-surface-dark text-zinc-950 dark:text-text-dark placeholder:text-zinc-400 dark:placeholder:text-muted-dark/40 font-lato text-sm outline-none transition-all focus:border-cyan-600 dark:focus:border-violet-400'
  const labelClass =
    'block   text-[10px] uppercase tracking-[0.25em] text-zinc-500 dark:text-muted-dark mb-2'

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="address-modal-title"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full sm:max-w-md max-h-[90dvh] overflow-y-auto bg-white dark:bg-bg-dark border border-zinc-200 dark:border-border-dark"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Corner tick marks */}
            <div
              className="absolute top-0 left-0 w-6 h-6 pointer-events-none z-10"
              aria-hidden="true"
            >
              <div className="absolute top-0 left-0 w-full h-px bg-cyan-600 dark:bg-violet-400" />
              <div className="absolute top-0 left-0 w-px h-full bg-cyan-600 dark:bg-violet-400" />
            </div>
            <div
              className="absolute top-0 right-0 w-6 h-6 pointer-events-none z-10"
              aria-hidden="true"
            >
              <div className="absolute top-0 right-0 w-full h-px bg-cyan-600 dark:bg-violet-400" />
              <div className="absolute top-0 right-0 w-px h-full bg-cyan-600 dark:bg-violet-400" />
            </div>
            <div
              className="absolute bottom-0 left-0 w-6 h-6 pointer-events-none z-10"
              aria-hidden="true"
            >
              <div className="absolute bottom-0 left-0 w-full h-px bg-cyan-600 dark:bg-violet-400" />
              <div className="absolute bottom-0 left-0 w-px h-full bg-cyan-600 dark:bg-violet-400" />
            </div>
            <div
              className="absolute bottom-0 right-0 w-6 h-6 pointer-events-none z-10"
              aria-hidden="true"
            >
              <div className="absolute bottom-0 right-0 w-full h-px bg-cyan-600 dark:bg-violet-400" />
              <div className="absolute bottom-0 right-0 w-px h-full bg-cyan-600 dark:bg-violet-400" />
            </div>

            {/* Top accent bar */}
            <div className="relative h-0.5 w-full overflow-hidden" aria-hidden="true">
              <div className="absolute inset-0 bg-cyan-600 dark:hidden" />
              <div className="absolute inset-0 hidden dark:block bg-linear-to-r from-violet-500 via-pink-400 to-violet-500 bg-size-[200%_100%] animate-[gradient-x_3s_ease_infinite]" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between p-5 430:p-6 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-px bg-cyan-600 dark:bg-violet-400" aria-hidden="true" />
                  <span className="  text-[10px] uppercase tracking-[0.25em] text-cyan-600 dark:text-violet-400">
                    {address ? 'Update Address' : 'Add Address'}
                  </span>
                </div>
                <h2
                  id="address-modal-title"
                  className="  text-xl 430:text-2xl uppercase leading-none text-zinc-950 dark:text-text-dark"
                >
                  Shipping Address
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close address modal"
                className="shrink-0 p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:text-muted-dark/50 dark:hover:text-text-dark dark:hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:focus-visible:ring-violet-400"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 430:px-6 pb-6 space-y-4">
              {success ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <div className="w-12 h-12 flex items-center justify-center bg-cyan-600/10 dark:bg-violet-400/10">
                    <CheckCircle
                      className="w-6 h-6 text-cyan-600 dark:text-violet-400"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="  text-sm uppercase tracking-wide text-zinc-950 dark:text-text-dark">
                    Address Updated
                  </p>
                </div>
              ) : (
                <>
                  {/* Name */}
                  <div>
                    <label htmlFor="addr-name" className={labelClass}>
                      Full Name{' '}
                      <span aria-hidden="true" className="text-red-500">
                        *
                      </span>
                      <span className="sr-only">(required)</span>
                    </label>
                    <input
                      id="addr-name"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className={inputClass}
                    />
                  </div>

                  {/* Address line 1 */}
                  <div>
                    <label htmlFor="addr-line1" className={labelClass}>
                      Street Address{' '}
                      <span aria-hidden="true" className="text-red-500">
                        *
                      </span>
                      <span className="sr-only">(required)</span>
                    </label>
                    <input
                      id="addr-line1"
                      type="text"
                      autoComplete="address-line1"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      placeholder="123 Main St"
                      className={inputClass}
                    />
                  </div>

                  {/* Address line 2 */}
                  <div>
                    <label htmlFor="addr-line2" className={labelClass}>
                      Apt, Suite, Unit
                    </label>
                    <input
                      id="addr-line2"
                      type="text"
                      autoComplete="address-line2"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      placeholder="Apt 4B (optional)"
                      className={inputClass}
                    />
                  </div>

                  {/* City + State */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="addr-city" className={labelClass}>
                        City{' '}
                        <span aria-hidden="true" className="text-red-500">
                          *
                        </span>
                        <span className="sr-only">(required)</span>
                      </label>
                      <input
                        id="addr-city"
                        type="text"
                        autoComplete="address-level2"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Lynn"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="addr-state" className={labelClass}>
                        State{' '}
                        <span aria-hidden="true" className="text-red-500">
                          *
                        </span>
                        <span className="sr-only">(required)</span>
                      </label>
                      <select
                        id="addr-state"
                        autoComplete="address-level1"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className={inputClass + ' appearance-none cursor-pointer'}
                      >
                        <option value="" disabled>
                          State
                        </option>
                        {STATES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.text}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* ZIP */}
                  <div>
                    <label htmlFor="addr-zip" className={labelClass}>
                      ZIP Code{' '}
                      <span aria-hidden="true" className="text-red-500">
                        *
                      </span>
                      <span className="sr-only">(required)</span>
                    </label>
                    <input
                      id="addr-zip"
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      value={zipPostalCode}
                      onChange={(e) => setZipPostalCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="01901"
                      maxLength={5}
                      className={inputClass}
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <div
                      role="alert"
                      aria-live="assertive"
                      className="flex items-start gap-3 px-4 py-3 border-l-2 border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-400/5"
                    >
                      <AlertCircle
                        className="w-4 h-4 shrink-0 mt-0.5 text-red-500 dark:text-red-400"
                        aria-hidden="true"
                      />
                      <p className="font-lato text-xs text-red-600 dark:text-red-400 leading-relaxed">
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="group relative w-full overflow-hidden flex items-center justify-center gap-2 px-6 py-3.5   text-sm uppercase tracking-widest text-white bg-cyan-600 hover:bg-cyan-500 dark:bg-violet-500 dark:hover:bg-violet-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:focus-visible:ring-violet-400"
                  >
                    <span
                      className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/15 to-transparent group-hover:animate-[shimmer_1.4s_ease_infinite] pointer-events-none"
                      aria-hidden="true"
                    />
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        <span>Saving...</span>
                        <span className="sr-only">Please wait</span>
                      </>
                    ) : address ? (
                      'Update Address'
                    ) : (
                      'Save Address'
                    )}
                  </button>

                  {/* Cancel */}
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full px-6 py-3   text-[10px] uppercase tracking-widest border border-zinc-200 hover:border-cyan-600/30 hover:bg-zinc-50 dark:border-border-dark dark:hover:border-violet-400/30 dark:hover:bg-white/5 text-zinc-500 dark:text-muted-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 dark:focus-visible:ring-violet-400"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
