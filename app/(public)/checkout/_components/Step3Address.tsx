import { updateAddress } from 'lib/actions/my-pack/updateAddress'
import { STATES } from 'lib/constants/location.constants'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FormField } from 'components/_primitives/FormField'

interface IAddress {
  addressLine1: string | null
  addressLine2?: string | null
  city: string | null
  state: string | null
  zipPostalCode: string | null
}

interface Props {
  inputs: any
  errors: Record<string, string>
  handleInput: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void
  onNext: () => void
  onBack: () => void
  userAddress: IAddress | null
  useSaved: boolean
  setUseSaved: (value: boolean) => void
  onUseDifferentAddress: () => void
  onUseSavedAddress: () => void
}

export function Step3Address({
  inputs,
  errors,
  handleInput,
  onNext,
  onBack,
  userAddress,
  useSaved,
  setUseSaved,
  onUseDifferentAddress,
  onUseSavedAddress
}: Props) {
  const [showReplaceModal, setShowReplaceModal] = useState(false)
  const router = useRouter()

  const handleContinue = async () => {
    if (!useSaved && userAddress) {
      setShowReplaceModal(true)
    } else {
      if (!userAddress) {
        await updateAddress({
          name: `${inputs?.firstName?.trim()} ${inputs?.lastName?.trim()}`,
          addressLine1: inputs?.addressLine1?.trim(),
          addressLine2: inputs?.addressLine2?.trim() || null,
          city: inputs?.city?.trim(),
          state: inputs?.state,
          zipPostalCode: inputs?.zipPostalCode?.trim(),
          country: 'US'
        })
        router.refresh()
      }
      onNext()
    }
  }

  const isValid = useSaved
    ? !!userAddress
    : !!inputs?.addressLine1?.trim() &&
      !!inputs?.city?.trim() &&
      !!inputs?.state &&
      !!inputs?.zipPostalCode?.trim()

  return (
    <>
      <AnimatePresence>
        {showReplaceModal && (
          <>
            <motion.div
              key="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={() => setShowReplaceModal(false)}
              aria-hidden="true"
            />
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="fixed top-1/2 -translate-y-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-sm z-50 bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark"
              role="dialog"
              aria-modal="true"
              aria-labelledby="replace-address-title"
            >
              <div className="px-6 py-5 border-b border-border-light dark:border-border-dark">
                <div className="flex items-center gap-3 mb-1">
                  <span
                    className="block w-4 h-px bg-primary-light dark:bg-primary-dark"
                    aria-hidden="true"
                  />
                  <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
                    Shipping Address
                  </p>
                </div>
                <h3
                  id="replace-address-title"
                  className="font-quicksand font-bold text-lg text-text-light dark:text-text-dark"
                >
                  Update saved address?
                </h3>
              </div>

              <div className="px-6 py-5">
                <p className="text-sm text-muted-light dark:text-muted-dark leading-relaxed mb-6">
                  Would you like to save this as your new address, or just use it for this order?
                </p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await updateAddress({
                        name: `${inputs?.firstName?.trim()} ${inputs?.lastName?.trim()}`,
                        addressLine1: inputs?.addressLine1?.trim(),
                        addressLine2: inputs?.addressLine2?.trim() || null,
                        city: inputs?.city?.trim(),
                        state: inputs?.state,
                        zipPostalCode: inputs?.zipPostalCode?.trim(),
                        country: 'US'
                      })
                      router.refresh()
                      setShowReplaceModal(false)
                      onNext()
                    }}
                    className="w-full py-3.5 text-[10px] font-mono tracking-[0.2em] uppercase bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark text-white transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                  >
                    Save &amp; continue
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReplaceModal(false)
                      onNext()
                    }}
                    className="w-full py-3.5 text-[10px] font-mono tracking-[0.2em] uppercase border-2 border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:border-primary-light dark:hover:border-primary-dark hover:text-text-light dark:hover:text-text-dark transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                  >
                    Just this order
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.div
        key="step-address"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <div>
          <h2 className="font-quicksand text-2xl font-bold text-text-light dark:text-text-dark mb-1">
            Shipping{' '}
            <span className="font-light text-muted-light dark:text-muted-dark">address</span>
          </h2>
          <p className="text-sm text-muted-light dark:text-muted-dark leading-relaxed">
            One or more items in your cart ship physically.
          </p>
        </div>

        {userAddress && useSaved ? (
          <div className="space-y-2">
            <button
              type="button"
              aria-pressed={true}
              className="w-full flex items-start justify-between px-3.5 py-3.5 border-2 border-primary-light dark:border-primary-dark bg-primary-light/5 dark:bg-primary-dark/5 text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              <div>
                <p className="text-[10px] font-mono tracking-[0.15em] uppercase text-primary-light dark:text-primary-dark mb-1">
                  Saved address
                </p>
                <p className="text-sm font-mono text-text-light dark:text-text-dark">
                  {userAddress.addressLine1}
                  {userAddress.addressLine2 && `, ${userAddress.addressLine2}`}
                </p>
                <p className="text-xs font-mono text-muted-light dark:text-muted-dark mt-0.5">
                  {userAddress.city}, {userAddress.state} {userAddress.zipPostalCode}
                </p>
              </div>
              <Check
                className="w-4 h-4 text-primary-light dark:text-primary-dark shrink-0 mt-0.5"
                aria-hidden="true"
              />
            </button>

            <button
              type="button"
              onClick={() => {
                setUseSaved(false)
                onUseDifferentAddress()
              }}
              className="w-full flex items-center gap-2 px-3.5 py-3 border border-dashed border-border-light dark:border-border-dark hover:border-primary-light dark:hover:border-primary-dark text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark text-[10px] font-mono tracking-[0.2em] uppercase transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              Use a different address
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {userAddress && (
              <button
                type="button"
                onClick={() => {
                  setUseSaved(true)
                  onUseSavedAddress()
                }}
                className="w-full flex items-center gap-2 px-3.5 py-2 text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                <ArrowLeft className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                Use saved address
              </button>
            )}

            <FormField
              id="checkout-addressLine1"
              label="Street Address"
              name="addressLine1"
              value={inputs?.addressLine1 ?? ''}
              onChange={handleInput}
              placeholder="123 Main Street"
              autoComplete="street-address"
              error={errors?.addressLine1}
              required
            />

            <FormField
              id="checkout-addressLine2"
              label="Unit / Apartment No."
              name="addressLine2"
              value={inputs?.addressLine2 ?? ''}
              onChange={handleInput}
              placeholder="Unit 1"
              autoComplete="street-address"
              error={errors?.addressLine2}
            />

            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3">
              <FormField
                id="checkout-city"
                label="City"
                name="city"
                value={inputs?.city ?? ''}
                onChange={handleInput}
                placeholder="Boston"
                autoComplete="address-level2"
                error={errors?.city}
                required
              />

              {/* State — select, use FormField with children */}
              <FormField
                id="checkout-state"
                label="State"
                name="state"
                type="select"
                value={inputs?.state ?? ''}
                onChange={handleInput}
                error={errors?.state}
                required
              >
                <option value="" disabled>
                  Select state
                </option>
                {STATES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.text}
                  </option>
                ))}
              </FormField>
            </div>

            <FormField
              id="checkout-zip"
              label="ZIP / Postal Code"
              name="zipPostalCode"
              value={inputs?.zipPostalCode ?? ''}
              onChange={handleInput}
              placeholder="02101"
              autoComplete="postal-code"
              error={errors?.zipPostalCode}
              required
              className="max-w-45"
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-4 text-[10px] font-mono tracking-[0.2em] uppercase border-2 border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:border-primary-light dark:hover:border-primary-dark hover:text-text-light dark:hover:text-text-dark transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Back
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!isValid}
            aria-disabled={!isValid}
            className={`flex-1 py-4 font-black text-[11px] tracking-[0.2em] uppercase font-mono transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark flex items-center justify-center gap-2 ${
              isValid
                ? 'bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark text-white cursor-pointer'
                : 'bg-surface-light dark:bg-surface-dark text-muted-light dark:text-muted-dark border-2 border-border-light dark:border-border-dark cursor-not-allowed'
            }`}
          >
            Continue
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </motion.div>
    </>
  )
}
