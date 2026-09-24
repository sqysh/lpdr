'use client'

import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import { FormField } from 'components/_primitives'
import { OFFLINE_PAYMENT_INSTRUCTIONS } from 'lib/constants/adoption-agreement.constants'
import type { UpdateAdoptionAgreementInput } from 'lib/schemas/adoption-agreement.schema'
import { Section } from './Secion'

type Fields = UpdateAdoptionAgreementInput

const IS_DEV = process.env.NODE_ENV !== 'production'

// Date inputs want YYYY-MM-DD; relative to today so the data never looks stale
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10)

export const DEV_FILL = {
  details: {
    dogColorMarkings: 'Black and tan, dapple on back',
    microchipNumber: '985112345678903',
    microchipManufacturer: 'AKC Reunite',
    microchipRegistration: 'Call AKC Reunite at 800-252-7894 or email chips@littlepawsdr.org within 30 days to transfer registration.'
  },
  medical: {
    rabiesDate: daysAgo(120),
    rabiesDuration: '1 year',
    bordetellaDate: daysAgo(90),
    bordetellaDuration: '6 months',
    distemperDate: daysAgo(120),
    spayNeuterDate: daysAgo(200),
    heartwormTest: `Negative, ${daysAgo(60)}`,
    fecalTest: `Negative, ${daysAgo(60)}`,
    heartwormPreventionDate: daysAgo(10),
    fleaTickPreventionDate: daysAgo(10),
    knownIssues: 'Mild separation anxiety. Car sickness, managed with medication for longer trips.'
  },
  fees: {
    healthCertificateFee: '45.00',
    paymentMethod: 'CARD'
  }
} satisfies Record<string, Partial<Fields>>

type Props = {
  register: UseFormRegister<Fields>
  errors: FieldErrors<Fields>
  fill: (values: Partial<Fields>) => void
  colorHint: string
  firstStep: number
}

export function AgreementDetailsForm({ register, errors, fill, colorHint, firstStep }: Props) {
  return (
    <>
      {IS_DEV && (
        <button
          type="button"
          onClick={() => fill({ ...DEV_FILL.details, ...DEV_FILL.medical, ...DEV_FILL.fees })}
          className="w-full py-2 border border-dashed border-amber-500/60 text-[10px] font-mono tracking-eyebrow uppercase text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
        >
          Fill all sections with test data
        </button>
      )}

      <Section step={firstStep} title="Dog details" onFill={() => fill(DEV_FILL.details)}>
        <FormField
          id="dogColorMarkings"
          label="Color & markings"
          {...register('dogColorMarkings')}
          hint={colorHint}
          error={errors.dogColorMarkings?.message}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField
            id="microchipNumber"
            label="Microchip number"
            {...register('microchipNumber')}
            error={errors.microchipNumber?.message}
          />
          <FormField
            id="microchipManufacturer"
            label="Microchip manufacturer"
            {...register('microchipManufacturer')}
            error={errors.microchipManufacturer?.message}
          />
        </div>
        <FormField
          id="microchipRegistration"
          label="How to register the microchip"
          type="textarea"
          rows={3}
          {...register('microchipRegistration')}
          hint="Directions for the adopter"
          error={errors.microchipRegistration?.message}
        />
      </Section>

      <Section step={firstStep + 1} title="Medical" onFill={() => fill(DEV_FILL.medical)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField id="rabiesDate" label="Rabies vaccine" type="date" {...register('rabiesDate')} error={errors.rabiesDate?.message} />
          <FormField
            id="rabiesDuration"
            label="Rabies duration"
            type="select"
            {...register('rabiesDuration')}
            error={errors.rabiesDuration?.message}
          >
            <option value="">Select</option>
            <option value="1 year">1 year</option>
            <option value="3 years">3 years</option>
          </FormField>
          <FormField
            id="bordetellaDate"
            label="Bordetella vaccine"
            type="date"
            {...register('bordetellaDate')}
            error={errors.bordetellaDate?.message}
          />
          <FormField
            id="bordetellaDuration"
            label="Bordetella duration"
            type="select"
            {...register('bordetellaDuration')}
            error={errors.bordetellaDuration?.message}
          >
            <option value="">Select</option>
            <option value="6 months">6 months</option>
            <option value="1 year">1 year</option>
          </FormField>
          <FormField
            id="distemperDate"
            label="Distemper vaccine"
            type="date"
            {...register('distemperDate')}
            error={errors.distemperDate?.message}
          />
          <FormField
            id="spayNeuterDate"
            label="Spay / neuter"
            type="date"
            {...register('spayNeuterDate')}
            error={errors.spayNeuterDate?.message}
          />
          <FormField
            id="heartwormTest"
            label="Heartworm test"
            {...register('heartwormTest')}
            placeholder="Negative, 08/12/2026"
            hint="Date and result"
            error={errors.heartwormTest?.message}
          />
          <FormField
            id="fecalTest"
            label="Fecal test"
            {...register('fecalTest')}
            placeholder="Negative, 08/12/2026"
            hint="Date and result"
            error={errors.fecalTest?.message}
          />
          <FormField
            id="heartwormPreventionDate"
            label="Heartworm prevention"
            type="date"
            {...register('heartwormPreventionDate')}
            hint="Date of the last monthly dose"
            error={errors.heartwormPreventionDate?.message}
          />
          <FormField
            id="fleaTickPreventionDate"
            label="Flea / tick prevention"
            type="date"
            {...register('fleaTickPreventionDate')}
            hint="Date of the last monthly dose"
            error={errors.fleaTickPreventionDate?.message}
          />
        </div>
        <FormField
          id="knownIssues"
          label="Known health or behavioral issues"
          type="textarea"
          rows={4}
          {...register('knownIssues')}
          error={errors.knownIssues?.message}
        />
      </Section>

      <Section step={firstStep + 2} title="Fees & payment" onFill={() => fill(DEV_FILL.fees)}>
        <p className="text-xs font-mono text-muted-light dark:text-muted-dark">
          The adoption fee is taken from the dog&apos;s RescueGroups listing when the agreement is sent.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField
            id="healthCertificateFee"
            label="Health certificate fee"
            inputMode="decimal"
            {...register('healthCertificateFee')}
            placeholder="0.00"
            hint="If applicable. What the vet charged for the certificate"
            error={errors.healthCertificateFee?.message}
          />
          <FormField
            id="paymentMethod"
            label="Payment method"
            type="select"
            {...register('paymentMethod')}
            hint="Card unless the adopter has asked to pay another way"
            error={errors.paymentMethod?.message}
          >
            <option value="CARD">Card</option>
            {Object.entries(OFFLINE_PAYMENT_INSTRUCTIONS).map(([value, { label }]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FormField>
        </div>
      </Section>
    </>
  )
}
