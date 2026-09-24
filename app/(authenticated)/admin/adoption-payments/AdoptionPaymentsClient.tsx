'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, DollarSign, Heart, HandCoins, Loader2, PawPrint, Percent } from 'lucide-react'
import type { IAdoptionPaymentRow } from 'lib/actions/admin/order/getAdoptionPayments'
import { OFFLINE_PAYMENT_INSTRUCTIONS } from 'lib/constants/adoption-agreement.constants'
import { Stat } from 'app/(authenticated)/admin/_components/Stat'
import AdminPageHeader from 'app/(authenticated)/admin/_components/AdminPageHeader'
import Picture from 'components/_common/Picture'
import { StatusPill } from 'components/_primitives'
import { formatMoney } from 'lib/utils/currency.utils'
import { formatDate } from 'lib/utils/date.utils'

const COL_COUNT = 7

const methodLabel = (method?: string | null) =>
  !method || method === 'CARD'
    ? 'Card'
    : (OFFLINE_PAYMENT_INSTRUCTIONS[method as keyof typeof OFFLINE_PAYMENT_INSTRUCTIONS]?.label ?? method)

export function AdoptionPaymentsClient({ payments }: { payments: IAdoptionPaymentRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [openingId, setOpeningId] = useState<string | null>(null)

  const open = (id: string) => {
    setOpeningId(id)
    startTransition(() => router.push(`/admin/transactions/${id}`))
  }

  const stats = useMemo(() => {
    const confirmed = payments.filter((p) => p.status === 'CONFIRMED')

    return {
      collected: confirmed.reduce((sum, p) => sum + Number(p.totalAmount), 0),
      adoptions: confirmed.length,
      // Donations given on top of adoption fees, kept separate since they're the tax-deductible part
      donations: confirmed.reduce((sum, p) => sum + Number(p.adoptionAgreement?.additionalDonation ?? 0), 0),
      feesCovered: confirmed.reduce((sum, p) => sum + (p.coverFees ? Number(p.feesCovered) : 0), 0)
    }
  }, [payments])

  return (
    <main id="main-content" className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
      <AdminPageHeader title="Adoption Payments" count={{ value: payments.length, noun: 'payment' }} />

      <div className="w-full px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat icon={DollarSign} label="Collected" value={formatMoney(stats.collected)} accent />
          <Stat icon={PawPrint} label="Adoptions Paid" value={String(stats.adoptions)} />
          <Stat icon={Heart} label="Extra Donations" value={formatMoney(stats.donations)} />
          <Stat icon={Percent} label="Fees Covered" value={formatMoney(stats.feesCovered)} />
        </div>

        <div className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark overflow-x-auto">
          <table className="w-full text-left">
            <caption className="sr-only">Adoption payments, newest first</caption>
            <thead>
              <tr className="border-b border-border-light dark:border-border-dark">
                {['Dog', 'Adopter', 'Method', 'Breakdown', 'Total', 'Date', ''].map((h, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="px-4 py-2.5 text-[9px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark font-normal whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {payments.length === 0 && (
                <tr>
                  <td colSpan={COL_COUNT} className="px-4 py-12 text-center">
                    <HandCoins className="w-5 h-5 mx-auto mb-2 text-muted-light/50 dark:text-muted-dark/50" aria-hidden="true" />
                    <p className="text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark">
                      No adoption payments yet
                    </p>
                  </td>
                </tr>
              )}

              {payments.map((p) => {
                const ag = p.adoptionAgreement
                const donation = Number(ag?.additionalDonation ?? 0)

                return (
                  <tr
                    key={p.id}
                    onClick={() => open(p.id)}
                    className="group cursor-pointer hover:bg-bg-light dark:hover:bg-bg-dark transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 shrink-0 overflow-hidden bg-bg-light dark:bg-bg-dark">
                          {ag?.dogPhoto && <Picture src={ag.dogPhoto} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="min-w-0">
                          {ag ? (
                            <Link
                              href={`/admin/adoption-agreements/${ag.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="block text-xs font-nunito font-bold text-text-light dark:text-text-dark truncate max-w-48 hover:text-primary-light dark:hover:text-primary-dark focus:outline-none focus-visible:underline"
                            >
                              {ag.dogName}
                            </Link>
                          ) : (
                            <p className="text-xs font-mono text-muted-light dark:text-muted-dark">No agreement linked</p>
                          )}
                          <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">#{p.id.slice(-8)}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 min-w-0 max-w-56">
                      <p className="text-xs font-nunito text-text-light dark:text-text-dark truncate">{p.customerName || '—'}</p>
                      <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark truncate">{p.customerEmail}</p>
                    </td>

                    <td className="px-4 py-3 text-[10px] font-mono text-muted-light dark:text-muted-dark whitespace-nowrap">
                      {methodLabel(ag?.paymentMethod)}
                    </td>

                    {/* The split Cathy reconciles against: fee, certificate, and any donation on top */}
                    <td className="px-4 py-3 text-[10px] font-mono text-muted-light dark:text-muted-dark whitespace-nowrap">
                      {ag ? (
                        <>
                          <span className="block">Fee {formatMoney(Number(ag.adoptionFee))}</span>
                          {Number(ag.healthCertificateFee ?? 0) > 0 && (
                            <span className="block">Cert {formatMoney(Number(ag.healthCertificateFee))}</span>
                          )}
                          {donation > 0 && (
                            <span className="block text-primary-light dark:text-primary-dark">Donation {formatMoney(donation)}</span>
                          )}
                        </>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-xs font-mono tabular-nums font-bold text-text-light dark:text-text-dark">
                        {formatMoney(p.totalAmount)}
                      </p>
                      <div className="mt-1">
                        <StatusPill status={p.status} />
                      </div>
                    </td>

                    <td className="px-4 py-3 text-xs font-mono text-muted-light dark:text-muted-dark whitespace-nowrap">
                      {formatDate(p.paidAt ?? p.createdAt, true)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {isPending && openingId === p.id ? (
                        <Loader2 className="w-3.5 h-3.5 inline animate-spin text-primary-light dark:text-primary-dark" aria-hidden="true" />
                      ) : (
                        <ChevronRight
                          className="w-3.5 h-3.5 inline text-muted-light dark:text-muted-dark group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors"
                          aria-hidden="true"
                        />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
