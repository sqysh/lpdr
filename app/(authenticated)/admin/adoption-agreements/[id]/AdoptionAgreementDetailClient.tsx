'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Check, Loader2, Pencil, Send } from 'lucide-react'
import type { IAdoptionAgreement } from 'types/adoption-agreement.types'
import { AGREEMENT_FILTER_LABELS, AGREEMENT_STATUS_HINT, OFFLINE_PAYMENT_INSTRUCTIONS } from 'lib/constants/adoption-agreement.constants'
import { agreementTotal } from 'lib/utils/adoption-agreement.utils'
import { sendAdoptionAgreement } from 'lib/actions/admin/adoption-agreement/sendAdoptionAgreement'
import Picture from 'components/_common/Picture'
import { FormError } from 'components/_primitives'
import { formatMoney } from 'lib/utils/currency.utils'
import { formatDate } from 'lib/utils/date.utils'
import { BreadcrumbSlash } from '../../transactions/[id]/_components/TransactionTopbar'
import { LinkBody } from 'components/_common/LinkBody'
import { CountersignPanel } from './_components/CountersignPanel'
import { MarkPaidPanel } from './_components/MarkPaidPanel'
import { ClosePanel } from './_components/ClosePanel'
import { RefundPanel } from 'components/features/payment/RefundPanel'

type Agreement = IAdoptionAgreement

const SIGNATURE_LABEL: Record<Agreement['signatures'][number]['role'], string> = {
  TERMS_ADOPTER: 'Terms, adopter',
  FINANCIAL_FIRST_ADOPTER: 'Financial, first adopter',
  FINANCIAL_SECOND_ADOPTER: 'Financial, second adopter',
  REPRESENTATIVE: 'Little Paws representative'
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
      <h2 className="px-4 py-2.5 border-b border-border-light dark:border-border-dark text-[9px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">
        {title}
      </h2>
      <div className="px-4 py-3">{children}</div>
    </section>
  )
}

// Label on the left, value on the right; a missing value shows as a dash rather than an empty gap
function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <dt className="text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark shrink-0">{label}</dt>
      <dd className="text-xs font-mono text-text-light dark:text-text-dark text-right">{value || '—'}</dd>
    </div>
  )
}

const date = (d: string | Date | null) => (d ? formatDate(d) : null)

const TRIAL_DAYS = 14

export function AdoptionAgreementDetailClient({ agreement: a }: { agreement: Agreement }) {
  const router = useRouter()
  const [isSending, startSend] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const adopter = [a.firstName, a.lastName].filter(Boolean).join(' ')
  const rep = [a.createdBy.firstName, a.createdBy.lastName].filter(Boolean).join(' ') || a.createdBy.email
  const paymentMethod = a.paymentMethod === 'CARD' ? 'Card' : OFFLINE_PAYMENT_INSTRUCTIONS[a.paymentMethod].label
  const canSend = a.status === 'DRAFT' || a.status === 'SENT'
  const emailFailed = a.status === 'SENT' && !!a.emailFailedAt

  const send = () => {
    setError(null)
    setNotice(null)

    startSend(async () => {
      const result = await sendAdoptionAgreement(a.id)

      if (result.success) setNotice(result.data?.resent ? 'Sent again.' : `Sent to ${a.email}.`)
      else setError(result.error)

      // Refreshed either way: a failed email still moves a draft to Sent, and the page should show that
      router.refresh()
    })
  }

  return (
    <main id="main-content" className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
      <header className="sticky top-0 z-10 w-full border-b border-border-light dark:border-border-dark bg-bg-light/90 dark:bg-bg-dark/90 backdrop-blur px-4 h-10 flex items-center justify-between">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 min-w-0">
          <Link
            href="/admin/adoption-agreements"
            className="flex items-center gap-2 text-[9px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
          >
            <BreadcrumbSlash />
            Agreements
          </Link>
          <span className="text-[9px] font-mono text-border-light dark:text-border-dark" aria-hidden="true">
            /
          </span>
          <p className="text-[9px] font-mono tracking-tag uppercase text-text-light dark:text-text-dark truncate" aria-current="page">
            {a.dogName}
          </p>
        </nav>
        <span className="shrink-0 text-[9px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">
          {AGREEMENT_FILTER_LABELS[a.status]} · {AGREEMENT_STATUS_HINT[a.status]}
        </span>
      </header>

      {emailFailed && (
        <div role="alert" className="flex items-start gap-3 px-4 sm:px-6 py-3 border-b border-red-500/30 bg-red-500/5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" aria-hidden="true" />
          <div className="text-xs font-mono text-red-600 dark:text-red-400">
            <p className="font-bold">The email to {a.email} failed to send.</p>
            <p className="mt-0.5 opacity-80">{a.emailFailureReason}</p>
          </div>
        </div>
      )}

      {(a.status === 'VOID' || a.status === 'RETURNED') && (
        <div
          role="note"
          className="px-4 sm:px-6 py-3 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-xs font-mono text-muted-light dark:text-muted-dark"
        >
          <span className="font-bold text-text-light dark:text-text-dark">{a.status === 'VOID' ? 'Cancelled' : 'Returned'}</span>
          {a.closedAt && ` on ${formatDate(a.closedAt)}`}
          {a.closedReason && `: ${a.closedReason}`}
        </div>
      )}

      <div className="w-full max-w-7xl px-4 sm:px-6 py-6 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
        {/* Left: what the agreement says */}
        <div className="space-y-6 min-w-0">
          <Panel title="Dog">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 shrink-0 overflow-hidden bg-bg-light dark:bg-bg-dark">
                {a.dogPhoto && <Picture src={a.dogPhoto} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-nunito font-bold text-text-light dark:text-text-dark">{a.dogName}</p>
                <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
                  #{a.dogRescueId} · {a.dogSex} · {a.dogAge}
                </p>
              </div>
            </div>
            <dl className="divide-y divide-border-light dark:divide-border-dark">
              <Row label="Color & markings" value={a.dogColorMarkings} />
              <Row label="Microchip" value={a.microchipNumber} />
              <Row label="Manufacturer" value={a.microchipManufacturer} />
            </dl>
            {a.microchipRegistration && (
              <p className="mt-2 text-xs font-mono text-muted-light dark:text-muted-dark whitespace-pre-wrap">{a.microchipRegistration}</p>
            )}
          </Panel>

          <Panel title="Medical">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 divide-y sm:divide-y-0 divide-border-light dark:divide-border-dark">
              <Row label="Rabies" value={a.rabiesDate && `${date(a.rabiesDate)}${a.rabiesDuration ? ` · ${a.rabiesDuration}` : ''}`} />
              <Row
                label="Bordetella"
                value={a.bordetellaDate && `${date(a.bordetellaDate)}${a.bordetellaDuration ? ` · ${a.bordetellaDuration}` : ''}`}
              />
              <Row label="Distemper" value={date(a.distemperDate)} />
              <Row label="Spay / neuter" value={date(a.spayNeuterDate)} />
              <Row label="Heartworm test" value={a.heartwormTest} />
              <Row label="Fecal test" value={a.fecalTest} />
              <Row label="Heartworm prevention" value={date(a.heartwormPreventionDate)} />
              <Row label="Flea / tick prevention" value={date(a.fleaTickPreventionDate)} />
            </dl>
            {a.knownIssues && (
              <div className="mt-3 pt-3 border-t border-border-light dark:border-border-dark">
                <p className="text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark mb-1">Known issues</p>
                <p className="text-xs font-nunito text-text-light dark:text-text-dark whitespace-pre-wrap">{a.knownIssues}</p>
              </div>
            )}
          </Panel>

          <Panel title="Signatures">
            {a.signatures.length === 0 ? (
              <p className="text-xs font-mono text-muted-light dark:text-muted-dark">Nothing signed yet.</p>
            ) : (
              <ul className="divide-y divide-border-light dark:divide-border-dark">
                {a.signatures.map((s) => (
                  <li key={s.role} className="flex items-start justify-between gap-4 py-2">
                    <div>
                      <p className="text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">
                        {SIGNATURE_LABEL[s.role]}
                      </p>
                      <p className="text-sm font-nunito italic text-text-light dark:text-text-dark">{s.typedName}</p>
                    </div>
                    <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark text-right">
                      {formatDate(s.signedAt, true)}
                      {s.ipAddress && <span className="block">{s.ipAddress}</span>}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-[10px] font-mono text-muted-light dark:text-muted-dark">Terms version {a.termsVersion}</p>
          </Panel>
        </div>

        {/* Right: who, how much, and what to do next */}
        <div className="space-y-6">
          {canSend && (
            <Panel title={a.status === 'DRAFT' ? 'Ready to send?' : 'Waiting for the adopter'}>
              <p className="text-xs font-mono text-muted-light dark:text-muted-dark mb-3">
                {a.status === 'DRAFT'
                  ? `Emails ${a.email} a link to review and sign. The adoption fee is confirmed from RescueGroups as it goes out.`
                  : emailFailed
                    ? 'Fix the problem above if needed, then send the email again.'
                    : `Sent ${date(a.sentAt)}. Send again if they can't find the email.`}
              </p>
              <Link
                href={`/admin/adoption-agreements/${a.id}/edit`}
                className="w-full inline-flex items-center justify-center gap-2 mb-2 px-4 py-2.5 border border-border-light dark:border-border-dark text-text-light dark:text-text-dark text-f10 font-mono tracking-eyebrow uppercase hover:border-primary-light dark:hover:border-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                <LinkBody icon={<Pencil className="w-3.5 h-3.5" aria-hidden="true" />} label="Edit details" />
              </Link>
              <button
                type="button"
                onClick={send}
                disabled={isSending}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-light dark:bg-primary-dark text-white text-f10 font-mono tracking-eyebrow uppercase hover:opacity-90 disabled:opacity-60 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                {isSending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                {a.status === 'DRAFT' ? 'Send to adopter' : 'Send again'}
              </button>
              {notice && (
                <p role="status" className="flex items-center gap-1.5 mt-2 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                  <Check className="w-3 h-3" aria-hidden="true" />
                  {notice}
                </p>
              )}
              <div className="mt-2">
                <FormError error={error} />
              </div>
            </Panel>
          )}

          {a.status === 'PAID' && (
            <Panel title="Countersign">
              <CountersignPanel agreementId={a.id} signerName={rep} />
            </Panel>
          )}

          {a.status === 'SIGNED' && a.paymentMethod !== 'CARD' && (
            <Panel title="Record payment">
              <MarkPaidPanel agreementId={a.id} methodLabel={paymentMethod} total={agreementTotal(a)} />
            </Panel>
          )}

          {['PAID', 'COMPLETE', 'RETURNED'].includes(a.status) && a.order && (
            <Panel title="Refund">
              {(() => {
                const remaining = Number(a.order.totalAmount) - Number(a.order.refundedAmount ?? 0)
                const adoptedOn = a.paidAt ? new Date(a.paidAt) : null
                const days =
                  a.status === 'RETURNED' && adoptedOn && a.closedAt
                    ? Math.floor((new Date(a.closedAt).getTime() - adoptedOn.getTime()) / 86_400_000)
                    : null
                const withinTrial = days !== null && days <= TRIAL_DAYS

                return (
                  <div className="space-y-3">
                    {/* Only a return has a trial question to answer */}
                    {days !== null && (
                      <p
                        className={`text-xs font-mono ${withinTrial ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}
                      >
                        Returned {days} day{days === 1 ? '' : 's'} after adoption.{' '}
                        {withinTrial
                          ? 'Within the two-week trial, so the adoption fee is refundable (clause 10).'
                          : "After the two-week trial, so a refund is at LPDR's discretion (clause 13)."}
                      </p>
                    )}

                    {Number(a.order.refundedAmount ?? 0) > 0 && (
                      <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                        Refunded {formatMoney(Number(a.order.refundedAmount))}
                        {a.order.refundedAt && ` on ${formatDate(a.order.refundedAt)}`} of {formatMoney(Number(a.order.totalAmount))}
                      </p>
                    )}

                    {remaining > 0 &&
                      (a.order.paymentIntentId ? (
                        <RefundPanel
                          orderId={a.order.id}
                          remaining={remaining}
                          presets={[
                            { label: 'Aplication fee', amount: Number(a.user.adoptionFees[0]?.feeAmount ?? 0) },
                            { label: 'Adoption fee', amount: Number(a.adoptionFee) },
                            { label: 'Certificate', amount: Number(a.healthCertificateFee ?? 0) },
                            { label: 'Donation', amount: Number(a.additionalDonation ?? 0) }
                          ]}
                        />
                      ) : (
                        <p className="text-xs font-mono text-muted-light dark:text-muted-dark">
                          Paid by {paymentMethod}, so any refund goes back the same way, outside the site.
                        </p>
                      ))}
                  </div>
                )
              })()}
            </Panel>
          )}

          <Panel title="Adopter">
            <dl className="divide-y divide-border-light dark:divide-border-dark">
              <Row label="Name" value={adopter} />
              <Row label="Email" value={a.email} />
              <Row label="Phone" value={a.phone} />
              <Row
                label="Address"
                value={
                  a.addressLine1 && (
                    <>
                      {a.addressLine1}
                      {a.addressLine2 && `, ${a.addressLine2}`}
                      <br />
                      {a.city}, {a.state} {a.zipPostalCode}
                    </>
                  )
                }
              />
            </dl>
          </Panel>

          <Panel title="Fees">
            {(() => {
              const application = a.user.adoptionFees[0]
              const applicationFee = application ? Number(application.feeAmount) : 0
              const subtotal = agreementTotal(a)
              const feesCovered = a.order?.coverFees ? Number(a.order.feesCovered) : 0
              // Before payment there's no charge yet, so the agreement total stands in for it
              const charged = a.order ? Number(a.order.totalAmount) : subtotal

              return (
                <dl className="divide-y divide-border-light dark:divide-border-dark">
                  {application && (
                    <Row
                      label="Application fee"
                      value={
                        <>
                          {formatMoney(applicationFee)}
                          <span className="block text-[10px] text-muted-light dark:text-muted-dark">
                            Paid separately {formatDate(application.createdAt)}
                            {application.orderId && (
                              <>
                                {' · '}
                                <Link
                                  href={`/admin/transactions/${application.orderId}`}
                                  className="text-primary-light dark:text-primary-dark hover:underline"
                                >
                                  view
                                </Link>
                              </>
                            )}
                          </span>
                        </>
                      }
                    />
                  )}
                  <Row label="Adoption fee" value={formatMoney(a.adoptionFee)} />
                  {a.healthCertificateFee != null && Number(a.healthCertificateFee) > 0 && (
                    <Row label="Health certificate" value={formatMoney(a.healthCertificateFee)} />
                  )}
                  {a.additionalDonation != null && Number(a.additionalDonation) > 0 && (
                    <Row label="Additional donation" value={formatMoney(a.additionalDonation)} />
                  )}
                  <Row label={a.order ? 'Agreement total' : 'Total due'} value={formatMoney(subtotal)} />
                  {feesCovered > 0 && <Row label="Processing fees covered" value={`+${formatMoney(feesCovered)}`} />}
                  {a.order && <Row label="Charged" value={formatMoney(charged)} />}
                  {application && (
                    <Row label="Total from adopter" value={<span className="font-bold">{formatMoney(applicationFee + charged)}</span>} />
                  )}
                </dl>
              )
            })()}
          </Panel>

          <Panel title="Payment">
            <dl className="divide-y divide-border-light dark:divide-border-dark">
              <Row label="Method" value={paymentMethod} />
              <Row label="Paid" value={date(a.paidAt)} />
              {a.order && (
                <Row
                  label="Order"
                  value={
                    <Link href={`/admin/transactions/${a.order.id}`} className="text-primary-light dark:text-primary-dark hover:underline">
                      #{a.order.id.slice(-8)}
                    </Link>
                  }
                />
              )}
            </dl>
          </Panel>

          <Panel title="Record">
            <dl className="divide-y divide-border-light dark:divide-border-dark">
              <Row label="Prepared by" value={rep} />
              <Row label="Created" value={date(a.createdAt)} />
              <Row label="Sent" value={date(a.sentAt)} />
            </dl>
          </Panel>

          {['DRAFT', 'SENT', 'SIGNED'].includes(a.status) && <ClosePanel agreementId={a.id} mode="void" />}
          {['PAID', 'COMPLETE'].includes(a.status) && <ClosePanel agreementId={a.id} mode="return" />}
        </div>
      </div>
    </main>
  )
}
