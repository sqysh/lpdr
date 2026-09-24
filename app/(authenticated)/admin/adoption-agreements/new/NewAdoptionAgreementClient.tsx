'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, UseFormRegister } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import AdminPageHeader from 'app/(authenticated)/admin/_components/AdminPageHeader'
import { FormError, SubmitButton } from 'components/_primitives'
import { createAdoptionAgreement } from 'lib/actions/admin/adoption-agreement/createAdoptionAgreement'
import {
  prepareAdoptionAgreementSchema,
  UpdateAdoptionAgreementInput,
  type PrepareAdoptionAgreementInput,
  type PrepareAdoptionAgreementValues
} from 'lib/schemas/adoption-agreement.schema'
import type { AdopterResult } from 'lib/actions/admin/adoption-agreement/searchAdopters'
import { AdopterSearch, ChosenSummary, DogPicker, type DogOption } from './_components/AgreementPickers'
import { Section } from '../_components/Secion'
import { AgreementDetailsForm } from '../_components/AgreementDetailsForm'

const EMPTY: PrepareAdoptionAgreementInput = {
  userId: '',
  dogRescueGroupsId: '',
  dogColorMarkings: '',
  microchipNumber: '',
  microchipManufacturer: '',
  microchipRegistration: '',
  rabiesDate: '',
  rabiesDuration: '',
  bordetellaDate: '',
  bordetellaDuration: '',
  distemperDate: '',
  spayNeuterDate: '',
  heartwormTest: '',
  fecalTest: '',
  heartwormPreventionDate: '',
  fleaTickPreventionDate: '',
  knownIssues: '',
  healthCertificateFee: '',
  paymentMethod: 'CARD'
}

export function NewAdoptionAgreementClient({
  availableDogs,
  holdDogs,
  unavailableDogs
}: {
  availableDogs: DogOption[]
  holdDogs: DogOption[]
  unavailableDogs: Record<string, string>
}) {
  const router = useRouter()
  const [adopter, setAdopter] = useState<AdopterResult | null>(null)
  const [dog, setDog] = useState<DogOption | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm<PrepareAdoptionAgreementInput, unknown, PrepareAdoptionAgreementValues>({
    resolver: zodResolver(prepareAdoptionAgreementSchema),
    defaultValues: EMPTY
  })

  const chooseAdopter = (a: AdopterResult | null) => {
    setAdopter(a)
    setValue('userId', a?.id ?? '', { shouldValidate: !!a })
  }

  const chooseDog = (d: DogOption | null) => {
    setDog(d)
    setValue('dogRescueGroupsId', d?.id ?? '', { shouldValidate: !!d })
    // Prefilled from the listing when RescueGroups has it, so it only needs typing when it's missing
    setValue('dogColorMarkings', d?.colorDetails ?? '')
  }

  const onSubmit = async () => {
    setSubmitError(null)

    // The raw form values go to the action, not the validated ones: the action parses the same schema
    // itself, and its date fields expect the strings a form produces rather than Date objects
    const result = await createAdoptionAgreement(getValues())

    if (!result.success) {
      setSubmitError(result.error)
      return
    }

    router.push(`/admin/adoption-agreements/${result.data.id}`)
  }

  const fill = (values: Partial<PrepareAdoptionAgreementInput>) => {
    for (const [key, value] of Object.entries(values)) {
      setValue(key as keyof PrepareAdoptionAgreementInput, value, { shouldValidate: true, shouldDirty: true })
    }
  }

  return (
    <main id="main-content" className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
      <AdminPageHeader title="New Adoption Agreement" />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full max-w-4xl px-4 sm:px-6 py-6 space-y-10">
        <Section step={1} title="Adopter">
          {adopter ? (
            <ChosenSummary label="Adopter" title={adopter.name} detail={adopter.email} onChange={() => chooseAdopter(null)} />
          ) : (
            <AdopterSearch onSelect={chooseAdopter} />
          )}
        </Section>

        {adopter && (
          <Section step={2} title="Dog">
            {dog ? (
              <ChosenSummary label="Dog" title={dog.name} photo={dog.photo} onChange={() => chooseDog(null)} />
            ) : (
              <DogPicker available={availableDogs} hold={holdDogs} unavailable={unavailableDogs} onSelect={chooseDog} />
            )}
          </Section>
        )}

        {adopter && dog && (
          <>
            <AgreementDetailsForm
              register={register as unknown as UseFormRegister<UpdateAdoptionAgreementInput>}
              errors={errors}
              fill={fill}
              firstStep={3}
              colorHint={
                dog.colorDetails
                  ? 'From the RescueGroups listing. Edit if it needs more detail'
                  : 'Not listed in RescueGroups, so describe it here'
              }
            />

            <FormError error={submitError} />
            <SubmitButton loading={isSubmitting} isValid={!!adopter && !!dog} label="Save draft" />
          </>
        )}
      </form>
    </main>
  )
}
