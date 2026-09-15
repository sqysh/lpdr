import { useWatch, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import { FormField } from 'components/_primitives'
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

export function InstantBuyNameSection({ register, control, errors, editing, saving, showCancel, onEdit, onCancel, onSave }: Props) {
  const [firstName, lastName] = useWatch({ control, name: ['firstName', 'lastName'] })

  return (
    <EditableSection
      label="Name"
      hint="Required to complete your purchase."
      editing={editing}
      saving={saving}
      showCancel={showCancel}
      saveLabel="Save Name"
      onEdit={onEdit}
      onCancel={onCancel}
      onSave={onSave}
      summary={
        <p className="font-lato text-sm text-text-light dark:text-text-dark">
          {firstName} {lastName}
        </p>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <FormField
          id="instant-buy-firstName"
          label="First Name"
          {...register('firstName')}
          autoComplete="given-name"
          placeholder="Jane"
          error={errors.firstName?.message}
          required
        />
        <FormField
          id="instant-buy-lastName"
          label="Last Name"
          {...register('lastName')}
          autoComplete="family-name"
          placeholder="Doe"
          error={errors.lastName?.message}
          required
        />
      </div>
    </EditableSection>
  )
}
