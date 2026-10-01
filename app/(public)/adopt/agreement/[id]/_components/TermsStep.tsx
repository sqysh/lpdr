import { useForm } from 'react-hook-form'
import { useStepSubmit } from '../_lib/useStepSubmit.hook'
import { AgreeCheckbox, Heading, StepProps } from './AgreementPrimitives'
import { SignTermsInput, signTermsSchema, SignTermsValues } from 'lib/schemas/adoption-agreement.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { AgreementDocument } from './AgreementDocument'
import { signAgreementTerms } from 'lib/actions/user/adoption-agreement/signAgreementTerms'
import { FormError, FormField, SubmitButton } from 'components/_primitives'

export function TermsStep({ data, loadedAt }: StepProps) {
  const a = data.agreement
  const { error, run, isRefreshing } = useStepSubmit()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm<SignTermsInput, unknown, SignTermsValues>({
    resolver: zodResolver(signTermsSchema),
    defaultValues: { agreementId: a.id, loadedAt, typedName: '', agreed: false }
  })

  return (
    <div className="space-y-10">
      <Heading eyebrow="Step 2 of 3" title={`Adopting ${a.dogName}`}>
        Please read the whole agreement, including {a.dogName}&apos;s medical details. If anything looks wrong, reply to your agreement
        email before signing and we&apos;ll correct it.
      </Heading>

      <AgreementDocument data={data} />

      <form
        onSubmit={handleSubmit(() => run(() => signAgreementTerms({ ...getValues(), loadedAt })))}
        noValidate
        className="space-y-5 p-5 border-2 border-primary-light/40 dark:border-primary-dark/40 bg-surface-light dark:bg-surface-dark"
      >
        <AgreeCheckbox
          id="agreed"
          label="I/We agree to statements 1 through 20 above."
          {...register('agreed')}
          error={errors.agreed?.message}
        />
        <FormField
          id="typedName"
          label="Type your full name to sign"
          autoComplete="name"
          placeholder={[a.firstName, a.lastName].filter(Boolean).join(' ')}
          inputClassName="font-signature! text-2xl! py-2!"
          required
          {...register('typedName')}
          error={errors.typedName?.message}
        />
        <p className="text-[11px] font-mono text-muted-light dark:text-muted-dark">
          Typing your name is your legal signature. We record the date and time you sign along with your account.
        </p>

        <FormError error={error} />
        <SubmitButton loading={isSubmitting || isRefreshing} isValid label="Sign and continue" />
      </form>
    </div>
  )
}
