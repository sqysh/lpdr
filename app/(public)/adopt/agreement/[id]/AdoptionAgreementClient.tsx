'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { CheckCircle, Clock, Home, Printer, User } from 'lucide-react'
import { formatMoney } from 'lib/utils/currency.utils'
import { agreementTotal } from 'lib/utils/adoption-agreement.utils'
import type { getAdoptionAgreementForAdopter } from 'lib/actions/user/adoption-agreement/getAdoptionAgreementForAdopter'
import { IPaymentMethod } from 'types/payment-method.types'
import { LinkBody } from 'components/_common/LinkBody'
import { Line } from 'components/_primitives'
import { useRefreshOnSignOut } from '@hooks/useRefreshOnSignOut.hook'
import { AgreementDocument, DetailsStep, DevStepBar, FinancialStep, SignatureList, StatusPanel, TermsStep } from './_components'
import { AgreementFooter } from './_components/AgreementFooter'
import { AgreementPayment } from './_components/AgreementPayment'

export type AgreementData = NonNullable<Awaited<ReturnType<typeof getAdoptionAgreementForAdopter>>['data']>

const IS_DEV = process.env.NODE_ENV !== 'production'

const actionClass =
  'inline-flex items-center justify-center gap-2 px-4 py-2 border border-border-light dark:border-border-dark text-f10 font-mono tracking-eyebrow uppercase text-text-light dark:text-text-dark hover:border-primary-light dark:hover:border-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark'

const DONE_COPY = {
  PAID: {
    title: 'Payment received',
    body: 'Thank you. Little Paws will countersign your agreement shortly and email you a copy. Your signed agreement is below.'
  },
  COMPLETE: {
    title: 'Your adoption is complete',
    body: 'Your agreement is signed by everyone. A copy has been emailed to you, and it stays here whenever you need it.'
  },
  RETURNED: {
    title: 'This adoption was returned',
    body: 'Your signed agreement is kept below for your records. If you have questions about the return, reply to any of your agreement emails.'
  }
} as const

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <main id="main-content" className="flex-1 w-full max-w-3xl mx-auto px-4 py-10 sm:py-16 space-y-10">
        <p className="text-f10 font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">
          Little Paws Dachshund Rescue · Adoption Agreement
        </p>
        {children}
      </main>
      <AgreementFooter />
    </div>
  )
}

function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={actionClass}>
      <Printer className="w-3.5 h-3.5" aria-hidden="true" />
      {label}
    </button>
  )
}

export function AdoptionAgreementClient({ userId, savedCards, ...data }: AgreementData & { userId: string; savedCards: IPaymentMethod[] }) {
  const a = data.agreement
  // What the page showed when it loaded. Signing is refused if the agreement has changed since
  const loadedAt = new Date(a.updatedAt).toISOString()
  const total = formatMoney(agreementTotal(a))

  useRefreshOnSignOut(true)

  const step = (() => {
    if (a.status === 'PAID' || a.status === 'COMPLETE' || a.status === 'RETURNED') return 'done'
    if (a.status === 'SIGNED') return 'payment'
    if (!data.steps.detailsComplete) return 'details'
    if (!data.steps.termsSigned) return 'terms'
    return 'financial'
  })()

  if (data.readOnly) {
    return (
      <Shell>
        <div className="print:hidden flex flex-wrap items-center justify-between gap-3 px-4 py-3 border border-amber-500/40 bg-amber-500/5">
          <p className="text-xs font-mono text-amber-700 dark:text-amber-400">
            Viewing as admin, read only. {a.firstName ? `${a.firstName} sees` : 'The adopter sees'} this agreement at the{' '}
            {step === 'done' ? 'completed' : step} step.
          </p>
          <PrintButton label="Print" />
        </div>

        <AgreementDocument data={data} />

        <section className="space-y-3">
          <h3 className="font-quicksand font-bold text-xl text-text-light dark:text-text-dark">Financial Agreement</h3>
          {data.terms && <p className="text-sm leading-relaxed text-text-light dark:text-text-dark">{data.terms.financial}</p>}
          <dl className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark divide-y divide-border-light dark:divide-border-dark">
            <Line label="Adoption fee" value={formatMoney(a.adoptionFee)} />
            {Number(a.healthCertificateFee ?? 0) > 0 && <Line label="Health certificate" value={formatMoney(a.healthCertificateFee)} />}
            {Number(a.additionalDonation ?? 0) > 0 && <Line label="Additional donation" value={formatMoney(a.additionalDonation)} accent />}
            <Line label="Total due" value={total} />
          </dl>
        </section>

        {a.signatures.length > 0 ? (
          <SignatureList signatures={a.signatures} />
        ) : (
          <p className="text-xs font-mono text-muted-light dark:text-muted-dark">Nothing signed yet.</p>
        )}
      </Shell>
    )
  }

  return (
    <Shell>
      {IS_DEV && <DevStepBar agreementId={a.id} current={step} />}

      {step === 'details' && <DetailsStep data={data} loadedAt={loadedAt} />}
      {step === 'terms' && <TermsStep data={data} loadedAt={loadedAt} />}
      {step === 'financial' && <FinancialStep data={data} loadedAt={loadedAt} />}

      {step === 'payment' &&
        (data.paymentInstructions ? (
          <StatusPanel
            icon={<Clock className="w-6 h-6 text-primary-light dark:text-primary-dark" aria-hidden="true" />}
            title="Signed. One last step"
          >
            <p>
              Please send <strong className="text-text-light dark:text-text-dark">{total}</strong> for {a.dogName}&apos;s adoption.
            </p>
            <p className="p-4 border-l-2 border-primary-light dark:border-primary-dark bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark">
              {data.paymentInstructions.instruction}
            </p>
            <p>Include {a.dogName}&apos;s name in the payment note. We&apos;ll confirm by email once it arrives.</p>
          </StatusPanel>
        ) : (
          <AgreementPayment
            agreementId={a.id}
            savedCards={savedCards}
            userId={userId}
            billingName={[a.firstName, a.lastName].filter(Boolean).join(' ')}
            billingEmail={a.email}
            additionalDonation={a.additionalDonation}
            adoptionFee={a.adoptionFee}
            healthCertificateFee={a.healthCertificateFee}
          />
        ))}

      {step === 'done' && (
        <>
          <div className="print:hidden">
            <StatusPanel
              icon={<CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />}
              title={DONE_COPY[a.status as keyof typeof DONE_COPY].title}
            >
              <p>{DONE_COPY[a.status as keyof typeof DONE_COPY].body}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link href="/my-pack" className={actionClass}>
                  <LinkBody icon={<User className="w-3.5 h-3.5" aria-hidden="true" />} label="My Pack" />
                </Link>
                <Link href="/" className={actionClass}>
                  <LinkBody icon={<Home className="w-3.5 h-3.5" aria-hidden="true" />} label="Home" />
                </Link>
                <PrintButton label="Print or save as PDF" />
              </div>
            </StatusPanel>
          </div>

          <AgreementDocument data={data} />
          <SignatureList signatures={a.signatures} />
        </>
      )}
    </Shell>
  )
}
