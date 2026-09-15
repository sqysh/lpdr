import { useWatch, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import { FormField } from 'components/_primitives'
import { STATES } from 'lib/constants/location.constants'
import type { AuctionPaymentInput } from 'lib/schemas/auction.schema'
import { EditableSection } from './EditableSection'

type Props = {
  register: UseFormRegister<AuctionPaymentInput>
  control: Control<AuctionPaymentInput>
  errors: FieldErrors<AuctionPaymentInput>
  editing: boolean
  saving: boolean
  showCancel: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
}

export function InstantBuyAddressSection({ register, control, errors, editing, saving, showCancel, onEdit, onCancel, onSave }: Props) {
  const [addressLine1, addressLine2, city, state, zipPostalCode] = useWatch({
    control,
    name: ['addressLine1', 'addressLine2', 'city', 'state', 'zipPostalCode']
  })

  return (
    <EditableSection
      label="Shipping Address"
      hint="Required for shipping your item."
      editing={editing}
      saving={saving}
      showCancel={showCancel}
      saveLabel="Save Address"
      onEdit={onEdit}
      onCancel={onCancel}
      onSave={onSave}
      summary={
        <>
          <p className="font-lato text-sm text-text-light dark:text-text-dark">{addressLine1}</p>
          {addressLine2 && <p className="font-lato text-sm text-text-light dark:text-text-dark">{addressLine2}</p>}
          <p className="font-lato text-sm text-text-light dark:text-text-dark">
            {city}, {state} {zipPostalCode}
          </p>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <FormField
            id="instant-buy-addressLine1"
            label="Address"
            {...register('addressLine1')}
            autoComplete="address-line1"
            placeholder="123 Main St"
            error={errors.addressLine1?.message}
            required
          />
        </div>
        <div className="col-span-2">
          <FormField
            id="instant-buy-addressLine2"
            label="Apt / Suite (optional)"
            {...register('addressLine2')}
            autoComplete="address-line2"
            placeholder="Apt 4B"
            error={errors.addressLine2?.message}
          />
        </div>
        <div className="col-span-2">
          <FormField
            id="instant-buy-city"
            label="City"
            {...register('city')}
            autoComplete="address-level2"
            placeholder="Boston"
            error={errors.city?.message}
            required
          />
        </div>
        <FormField id="instant-buy-state" label="State" type="select" {...register('state')} error={errors.state?.message} required>
          <option value="">Select a state</option>
          {STATES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.text}
            </option>
          ))}
        </FormField>
        <FormField
          id="instant-buy-zip"
          label="ZIP"
          {...register('zipPostalCode')}
          autoComplete="postal-code"
          placeholder="02101"
          error={errors.zipPostalCode?.message}
          maxLength={10}
          required
        />
      </div>
    </EditableSection>
  )
}
