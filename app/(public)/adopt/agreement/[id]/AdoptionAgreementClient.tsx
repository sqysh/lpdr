'use client'

import { CheckCircle, Clock, Home, Printer, User } from 'lucide-react'
import { formatMoney } from 'lib/utils/currency.utils'
import { agreementTotal } from 'lib/utils/adoption-agreement.utils'
import type { getAdoptionAgreementForAdopter } from 'lib/actions/user/adoption-agreement/getAdoptionAgreementForAdopter'
import { DetailsStep, FinancialStep, TermsStep } from './_components/AgreementSteps'
import { IPaymentMethod } from 'types/payment-method.types'
import { AgreementPayment } from './_components/AgreementPayment'
import { AgreementFooter } from './_components/AgreementFooter'
import { AgreementDocument } from './_components/AgreementDcoument'
import { SignatureList } from './_components/SignatureList'
import { StatusPanel } from './_components/AgreementPrimitives'
import { DevStepBar } from './_components/DevStepBar'
import Link from 'next/link'
import { LinkBody } from 'components/_common/LinkBody'
import { useRefreshOnSignOut } from '@hooks/useRefreshOnSIgnOut.hook'

export type AgreementData = NonNullable<Awaited<ReturnType<typeof getAdoptionAgreementForAdopter>>['data']>

const IS_DEV = process.env.NODE_ENV !== 'production'

const actionClass =
  'inline-flex items-center justify-center gap-2 px-4 py-2 border border-border-light dark:border-border-dark text-f10 font-mono tracking-eyebrow uppercase text-text-light dark:text-text-dark hover:border-primary-light dark:hover:border-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark'

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

  return (
    <div className="min-h-dvh flex flex-col">
      <main id="main-content" className="flex-1 w-full max-w-3xl mx-auto px-4 py-10 sm:py-16">
        <p className="text-f10 font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark mb-8">
          Little Paws Dachshund Rescue · Adoption Agreement
        </p>

        {IS_DEV && <DevStepBar agreementId={a.id} current={step} />}

        {step === 'details' && <DetailsStep data={data} loadedAt={loadedAt} />}
        {step === 'terms' && <TermsStep data={data} loadedAt={loadedAt} />}
        {step === 'financial' && <FinancialStep data={data} loadedAt={loadedAt} />}

        {step === 'payment' && data.paymentInstructions && (
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
        )}

        {step === 'payment' && !data.paymentInstructions && (
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
        )}

        {step === 'done' && (
          <div className="space-y-10">
            <div className="print:hidden">
              <StatusPanel
                icon={<CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />}
                title={
                  a.status === 'COMPLETE'
                    ? 'Your adoption is complete'
                    : a.status === 'RETURNED'
                      ? 'This adoption was returned'
                      : 'Payment received'
                }
              >
                <p>
                  {a.status === 'COMPLETE'
                    ? 'Your agreement is signed by everyone. A copy has been emailed to you, and it stays here whenever you need it.'
                    : a.status === 'RETURNED'
                      ? 'Your signed agreement is kept below for your records. If you have questions about the return, reply to any of your agreement emails.'
                      : 'Thank you. Little Paws will countersign your agreement shortly and email you a copy. Your signed agreement is below.'}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Link href="/my-pack" className={actionClass}>
                    <LinkBody icon={<User className="w-3.5 h-3.5" aria-hidden="true" />} label="My Pack" />
                  </Link>
                  <Link href="/" className={actionClass}>
                    <LinkBody icon={<Home className="w-3.5 h-3.5" aria-hidden="true" />} label="Home" />
                  </Link>
                  <button type="button" onClick={() => window.print()} className={actionClass}>
                    <Printer className="w-3.5 h-3.5" aria-hidden="true" />
                    Print or save as PDF
                  </button>
                </div>
              </StatusPanel>
            </div>

            <AgreementDocument data={data} />
            <SignatureList signatures={a.signatures} />
          </div>
        )}
      </main>
      <AgreementFooter />
    </div>
  )
}
