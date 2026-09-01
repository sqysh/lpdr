import { Loader2 } from 'lucide-react'
import { FormField } from 'components/_primitives'
import { STATES } from 'lib/constants/location.constants'

type AddressErrors = {
  addressLine1?: string
  city?: string
  state?: string
  zipPostalCode?: string
}

type AddressInputs = {
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  zipPostalCode: string
}

type Props = {
  inputs: AddressInputs
  hasAddress: boolean
  savingAddress: boolean
  addressErrors: AddressErrors
  showCancel: boolean
  onPatch: (data: Partial<AddressInputs>) => void
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
}

export function InstantBuyAddressSection({
  inputs,
  hasAddress,
  savingAddress,
  addressErrors,
  showCancel,
  onPatch,
  onEdit,
  onCancel,
  onSave
}: Props) {
  const saveDisabled =
    !inputs.addressLine1.trim() ||
    !inputs.city.trim() ||
    !inputs.state.trim() ||
    !inputs.zipPostalCode.trim() ||
    savingAddress

  return (
    <section
      aria-label={hasAddress ? 'Shipping address' : 'Enter shipping address'}
      className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
    >
      {hasAddress ? (
        <>
          <div className="px-4 py-3 border-b border-border-light dark:border-border-dark flex items-center justify-between">
            <p className="text-f10 uppercase tracking-[0.25em] text-muted-light dark:text-muted-dark">
              Shipping Address
            </p>
            <button
              type="button"
              onClick={onEdit}
              className="text-f10 uppercase tracking-[0.2em] text-primary-light dark:text-primary-dark hover:text-secondary-light dark:hover:text-secondary-dark transition-colors focus-visible:outline-none"
            >
              Edit
            </button>
          </div>
          <div className="px-4 py-3 space-y-0.5">
            <p className="font-lato text-sm text-text-light dark:text-text-dark">
              {inputs.addressLine1}
            </p>
            {inputs.addressLine2 && (
              <p className="font-lato text-sm text-text-light dark:text-text-dark">
                {inputs.addressLine2}
              </p>
            )}
            <p className="font-lato text-sm text-text-light dark:text-text-dark">
              {inputs.city}, {inputs.state} {inputs.zipPostalCode}
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="px-4 py-3 border-b border-border-light dark:border-border-dark">
            <h2 className="text-f10 uppercase tracking-[0.25em] text-muted-light dark:text-muted-dark">
              Shipping Address
            </h2>
            <p className="font-lato text-xs text-muted-light dark:text-muted-dark mt-0.5">
              Required for shipping your item.
            </p>
          </div>
          <div className="px-4 py-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <FormField
                  id="addressLine1"
                  name="addressLine1"
                  label="Address"
                  value={inputs.addressLine1}
                  onChange={(e) => onPatch({ addressLine1: e.target.value })}
                  autoComplete="address-line1"
                  placeholder="123 Main St"
                  error={addressErrors.addressLine1}
                />
              </div>
              <div className="col-span-2">
                <FormField
                  id="addressLine2"
                  name="addressLine2"
                  label="Apt / Suite (optional)"
                  value={inputs.addressLine2}
                  onChange={(e) => onPatch({ addressLine2: e.target.value })}
                  autoComplete="address-line2"
                  placeholder="Apt 4B"
                />
              </div>
              <div className="col-span-2">
                <FormField
                  id="city"
                  name="city"
                  label="City"
                  value={inputs.city}
                  onChange={(e) => onPatch({ city: e.target.value })}
                  autoComplete="address-level2"
                  placeholder="Boston"
                  error={addressErrors.city}
                />
              </div>
              <FormField
                id="state"
                name="state"
                label="State"
                type="select"
                value={inputs.state}
                onChange={(e) => onPatch({ state: e.target.value })}
                error={addressErrors.state}
              >
                <option value="">Select a state</option>
                {STATES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.text}
                  </option>
                ))}
              </FormField>
              <FormField
                id="zipPostalCode"
                name="zipPostalCode"
                label="ZIP"
                value={inputs.zipPostalCode}
                onChange={(e) => onPatch({ zipPostalCode: e.target.value })}
                autoComplete="postal-code"
                placeholder="02101"
                error={addressErrors.zipPostalCode}
                maxLength={5}
              />
            </div>
            <div className="flex gap-3">
              {showCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 py-2.5 px-4 border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark text-f10 uppercase tracking-[0.25em] hover:text-text-light dark:hover:text-text-dark transition-colors focus-visible:outline-none"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={onSave}
                disabled={saveDisabled}
                className="flex-1 py-2.5 px-4 bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-f10 uppercase tracking-[0.25em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                {savingAddress ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                    Saving...
                  </span>
                ) : (
                  'Save Address'
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
