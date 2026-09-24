'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, ChevronLeft } from 'lucide-react'
import AdminPageHeader from 'app/(authenticated)/admin/_components/AdminPageHeader'
import { FormError, SubmitButton } from 'components/_primitives'
import Picture from 'components/_common/Picture'
import { updateAdoptionAgreement } from 'lib/actions/admin/adoption-agreement/updateAdoptionAgreement'
import {
  updateAdoptionAgreementSchema,
  type UpdateAdoptionAgreementInput,
  type UpdateAdoptionAgreementValues
} from 'lib/schemas/adoption-agreement.schema'
import type { IAdoptionAgreement } from 'types/adoption-agreement.types'
import { AgreementDetailsForm } from '../../_components/AgreementDetailsForm'
import { Section } from '../../_components/Secion'
import Link from 'next/link'
import { LinkBody } from 'components/_common/LinkBody'

// Stored dates were saved at noon UTC, so the first ten characters are always the intended day
const toDateInput = (d: string | Date | null) => (d ? new Date(d).toISOString().slice(0, 10) : '')

function toFormValues(a: IAdoptionAgreement): UpdateAdoptionAgreementInput {
  return {
    dogColorMarkings: a.dogColorMarkings ?? '',
    microchipNumber: a.microchipNumber ?? '',
    microchipManufacturer: a.microchipManufacturer ?? '',
    microchipRegistration: a.microchipRegistration ?? '',
    rabiesDate: toDateInput(a.rabiesDate),
    rabiesDuration: a.rabiesDuration ?? '',
    bordetellaDate: toDateInput(a.bordetellaDate),
    bordetellaDuration: a.bordetellaDuration ?? '',
    distemperDate: toDateInput(a.distemperDate),
    spayNeuterDate: toDateInput(a.spayNeuterDate),
    heartwormTest: a.heartwormTest ?? '',
    fecalTest: a.fecalTest ?? '',
    heartwormPreventionDate: toDateInput(a.heartwormPreventionDate),
    fleaTickPreventionDate: toDateInput(a.fleaTickPreventionDate),
    knownIssues: a.knownIssues ?? '',
    healthCertificateFee: a.healthCertificateFee != null ? Number(a.healthCertificateFee).toFixed(2) : '',
    paymentMethod: a.paymentMethod
  }
}

function Locked({ label, title, detail, photo }: { label: string; title: string; detail?: string; photo?: string | null }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
      {photo !== undefined && (
        <div className="w-10 h-10 shrink-0 overflow-hidden bg-bg-light dark:bg-bg-dark">
          {photo && <Picture src={photo} alt="" className="w-full h-full object-cover" />}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[9px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">{label}</p>
        <p className="text-sm font-nunito font-bold text-text-light dark:text-text-dark truncate">{title}</p>
        {detail && <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark truncate">{detail}</p>}
      </div>
    </div>
  )
}

export function EditAdoptionAgreementClient({ agreement: a }: { agreement: IAdoptionAgreement }) {
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting, isDirty }
  } = useForm<UpdateAdoptionAgreementInput, unknown, UpdateAdoptionAgreementValues>({
    resolver: zodResolver(updateAdoptionAgreementSchema),
    defaultValues: toFormValues(a)
  })

  const fill = (values: Partial<UpdateAdoptionAgreementInput>) => {
    for (const [key, value] of Object.entries(values)) {
      setValue(key as keyof UpdateAdoptionAgreementInput, value, { shouldValidate: true, shouldDirty: true })
    }
  }

  const onSubmit = async () => {
    setSubmitError(null)

    // Raw values, since the action parses the same schema and expects the strings a form produces
    const result = await updateAdoptionAgreement(a.id, getValues())

    if (!result.success) {
      setSubmitError(result.error)
      return
    }

    router.push(`/admin/adoption-agreements/${a.id}`)
  }

  const adopterName = [a.firstName, a.lastName].filter(Boolean).join(' ') || a.email

  return (
    <main id="main-content" className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
      <AdminPageHeader title={`Edit agreement for ${a.dogName}`} />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full max-w-4xl px-4 sm:px-6 py-6 space-y-10">
        {a.status === 'SENT' && (
          <p
            role="note"
            className="flex items-start gap-2 px-4 py-3 border border-amber-500/30 bg-amber-500/5 text-xs font-mono text-amber-700 dark:text-amber-400"
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
            This agreement has already been sent. The adopter will see your changes when they next open it, and if they have it open now,
            they&apos;ll be asked to review the changes before signing.
          </p>
        )}

        {/* The adopter and dog can't change here; a different adopter or dog is a new agreement */}
        <Section step={1} title="Adopter">
          <Locked label="Adopter" title={adopterName} detail={a.email} />
        </Section>

        <Section step={2} title="Dog">
          <Locked label="Dog" title={a.dogName} detail={`#${a.dogRescueId}`} photo={a.dogPhoto} />
        </Section>

        <AgreementDetailsForm register={register} errors={errors} fill={fill} firstStep={3} colorHint="Edit if it needs more detail" />

        <FormError error={submitError} />

        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <Link
            href={`/admin/adoption-agreements/${a.id}`}
            className="sm:w-48 shrink-0 inline-flex items-center justify-center gap-2 px-4 py-3 border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark text-f10 font-mono tracking-eyebrow uppercase hover:text-text-light dark:hover:text-text-dark hover:border-primary-light dark:hover:border-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark whitespace-nowrap"
          >
            <LinkBody icon={<ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />} label={isDirty ? 'Cancel' : 'Back to agreement'} />
          </Link>
          <div className="flex-1">
            <SubmitButton loading={isSubmitting} isValid={isDirty} label="Save changes" />
          </div>
        </div>
      </form>
    </main>
  )
}
