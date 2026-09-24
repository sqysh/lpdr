'use client'

import Link from 'next/link'
import { ArrowRight, FileSignature, PawPrint } from 'lucide-react'
import Picture from 'components/_common/Picture'
import { LinkBody } from 'components/_common/LinkBody'
import { formatMoney } from 'lib/utils/currency.utils'
import { formatDate } from 'lib/utils/date.utils'
import { agreementTotal } from 'lib/utils/adoption-agreement.utils'
import { OFFLINE_PAYMENT_INSTRUCTIONS } from 'lib/constants/adoption-agreement.constants'
import type { MyAdoptionAgreement } from 'lib/actions/my-pack/getMyAdoptionAgreements'

type Stage = { label: string; detail: string; tone: string; needsAdopter: boolean; cta: string }

// Where the adoption stands, in the adopter's terms. needsAdopter marks the stages waiting on them rather than on LPDR
function stageOf(a: MyAdoptionAgreement): Stage {
  const termsSigned = a.signatures.some((s) => s.role === 'TERMS_ADOPTER')

  switch (a.status) {
    case 'SENT':
      return {
        label: termsSigned ? 'Almost signed' : 'Ready to sign',
        detail: termsSigned ? 'The financial page still needs your signature.' : 'Review the agreement and sign when you’re ready.',
        tone: 'text-primary-light dark:text-primary-dark',
        needsAdopter: true,
        cta: termsSigned ? 'Continue signing' : 'Review and sign'
      }
    case 'SIGNED':
      return a.paymentMethod === 'CARD'
        ? {
            label: 'Payment due',
            detail: 'Signed. Pay by card to complete the adoption.',
            tone: 'text-amber-600 dark:text-amber-400',
            needsAdopter: true,
            cta: 'Pay now'
          }
        : {
            label: 'Payment due',
            detail: `Signed. Send payment by ${OFFLINE_PAYMENT_INSTRUCTIONS[a.paymentMethod].label} to complete the adoption.`,
            tone: 'text-amber-600 dark:text-amber-400',
            needsAdopter: true,
            cta: 'See payment details'
          }
    case 'PAID':
      return {
        label: 'Paid',
        detail: 'Little Paws will countersign your agreement shortly.',
        tone: 'text-violet-600 dark:text-violet-400',
        needsAdopter: false,
        cta: 'View agreement'
      }
    case 'COMPLETE':
      return {
        label: 'Complete',
        detail: 'Your adoption is complete.',
        tone: 'text-emerald-600 dark:text-emerald-400',
        needsAdopter: false,
        cta: 'View agreement'
      }
    default:
      return {
        label: 'Returned',
        detail: 'This adoption was returned.',
        tone: 'text-muted-light dark:text-muted-dark',
        needsAdopter: false,
        cta: 'View agreement'
      }
  }
}

const total = (a: MyAdoptionAgreement) =>
  a.order
    ? Number(a.order.totalAmount)
    : agreementTotal({
        adoptionFee: Number(a.adoptionFee),
        healthCertificateFee: a.healthCertificateFee == null ? null : Number(a.healthCertificateFee),
        additionalDonation: a.additionalDonation == null ? null : Number(a.additionalDonation)
      })

/** Shown above the tabs on every My Pack view while an adoption is waiting on the adopter. */
export function AdoptionActionBanner({ agreements }: { agreements: MyAdoptionAgreement[] }) {
  const waiting = agreements.find((a) => stageOf(a).needsAdopter)
  if (!waiting) return null

  const stage = stageOf(waiting)

  return (
    <Link
      href={`/adopt/agreement/${waiting.id}`}
      className="group flex items-center gap-4 p-4 mb-6 border border-primary-light/40 dark:border-primary-dark/40 bg-primary-light/5 dark:bg-primary-dark/5 hover:border-primary-light dark:hover:border-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
    >
      <div className="w-12 h-12 shrink-0 overflow-hidden bg-surface-light dark:bg-surface-dark">
        {waiting.dogPhoto && <Picture src={waiting.dogPhoto} alt="" className="w-full h-full object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-f10 font-mono tracking-eyebrow uppercase ${stage.tone}`}>{stage.label}</p>
        <p className="text-sm text-text-light dark:text-text-dark truncate">{waiting.dogName}</p>
        <p className="text-xs text-muted-light dark:text-muted-dark">{stage.detail}</p>
      </div>
      <span className="shrink-0 inline-flex items-center gap-1.5 text-f10 font-mono tracking-eyebrow uppercase text-primary-light dark:text-primary-dark">
        <LinkBody icon={<ArrowRight className="w-3 h-3" aria-hidden="true" />} label={stage.cta} iconAfter />
      </span>
    </Link>
  )
}

export function AdoptionsTab({ agreements }: { agreements: MyAdoptionAgreement[] }) {
  if (agreements.length === 0) {
    return (
      <div className="py-16 text-center space-y-3">
        <PawPrint className="w-6 h-6 mx-auto text-muted-light/60 dark:text-muted-dark/60" aria-hidden="true" />
        <p className="text-sm text-muted-light dark:text-muted-dark">
          Your adoption agreements will appear here once Little Paws sends one to you.
        </p>
        <Link
          href="/dachshunds"
          className="inline-block text-f10 font-mono tracking-eyebrow uppercase text-primary-light dark:text-primary-dark hover:underline"
        >
          Meet the dachshunds
        </Link>
      </div>
    )
  }

  return (
    <ul className="space-y-3" role="list">
      {agreements.map((a) => {
        const stage = stageOf(a)

        return (
          <li
            key={a.id}
            className={`border bg-surface-light dark:bg-surface-dark ${stage.needsAdopter ? 'border-primary-light/40 dark:border-primary-dark/40' : 'border-border-light dark:border-border-dark'}`}
          >
            <div className="flex items-start gap-4 p-4">
              <div className="w-16 h-16 shrink-0 overflow-hidden bg-bg-light dark:bg-bg-dark">
                {a.dogPhoto && <Picture src={a.dogPhoto} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className={`text-f10 font-mono tracking-eyebrow uppercase ${stage.tone}`}>{stage.label}</p>
                <p className="font-quicksand font-bold text-text-light dark:text-text-dark">{a.dogName}</p>
                <p className="text-xs text-muted-light dark:text-muted-dark">{stage.detail}</p>
                <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                  {formatMoney(total(a))}
                  {a.paidAt ? ` · paid ${formatDate(a.paidAt)}` : a.sentAt ? ` · sent ${formatDate(a.sentAt)}` : ''}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 px-4 pb-4">
              <Link
                href={`/adopt/agreement/${a.id}`}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-f10 font-mono tracking-eyebrow uppercase transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark ${
                  stage.needsAdopter
                    ? 'bg-primary-light dark:bg-primary-dark text-white hover:opacity-90'
                    : 'border border-border-light dark:border-border-dark text-text-light dark:text-text-dark hover:border-primary-light dark:hover:border-primary-dark'
                }`}
              >
                <LinkBody icon={<FileSignature className="w-3 h-3" aria-hidden="true" />} label={stage.cta} />
              </Link>
              {a.order && (
                <Link
                  href={`/order-confirmation/${a.order.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-border-light dark:border-border-dark text-f10 font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors"
                >
                  <LinkBody icon={null} label="Receipt" />
                </Link>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
