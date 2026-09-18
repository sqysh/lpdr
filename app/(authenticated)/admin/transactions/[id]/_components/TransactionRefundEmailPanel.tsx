'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, Mail } from 'lucide-react'
import { formatDate } from 'lib/utils/date.utils'
import { REFUND_REASONS, type RefundReason } from 'lib/constants/refund.constants'
import { sendRefundEmail } from 'lib/actions/admin/order/sendRefundEmail'
import { StatusMessage } from 'components/_primitives/StatusMessage'
import { useStatusMessage } from '@hooks/useStatusMessage.hook'
import { IOrder } from 'types/order.types'

const EYEBROW = 'text-f9 font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark'

export function TransactionRefundEmailPanel({ order }: { order: IOrder }) {
  const router = useRouter()
  const { status, flash } = useStatusMessage()

  const [picking, setPicking] = useState(false)
  const [sending, setSending] = useState<RefundReason | null>(null)

  if (order.status !== 'REFUNDED') return null

  const send = async (reason: RefundReason) => {
    setSending(reason)

    const result = await sendRefundEmail(order.id, reason)

    setSending(null)

    if (!result.success) {
      flash({ tone: 'error', message: 'The email did not send', description: result.error ?? undefined })
      return
    }

    setPicking(false)
    flash({ tone: 'success', message: `Emailed ${order.customerEmail}` })
    router.refresh()
  }

  return (
    <section className="border border-border-light dark:border-border-dark">
      <div className="px-4 py-2.5 border-b border-border-light dark:border-border-dark">
        <h2 className={EYEBROW}>Let them know</h2>
      </div>

      <div className="p-4 space-y-3">
        <StatusMessage status={status} />

        {order.refundEmailSentAt ? (
          <p className="flex items-start gap-2 text-f10 font-mono text-muted-light dark:text-muted-dark leading-relaxed">
            <Check size={13} className="text-emerald-500 shrink-0 mt-px" aria-hidden="true" />
            Refund email sent to {order.customerEmail} on {formatDate(order.refundEmailSentAt, true)}.
          </p>
        ) : picking ? (
          <>
            {/* Picking the reason is the whole interaction: choosing sends it. */}
            <p className="text-f10 font-mono text-muted-light dark:text-muted-dark leading-relaxed">
              Pick what happened and we will email {order.customerEmail}. The amount and the timing are already in the message.
            </p>

            <div className="flex flex-col gap-px">
              {(Object.keys(REFUND_REASONS) as RefundReason[]).map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => send(reason)}
                  disabled={sending !== null}
                  className="flex items-center justify-between gap-3 px-3.5 py-3 border border-border-light dark:border-border-dark text-left text-xs font-nunito text-text-light dark:text-text-dark hover:border-primary-light/40 dark:hover:border-primary-dark/40 hover:bg-primary-light/5 dark:hover:bg-primary-dark/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                >
                  {REFUND_REASONS[reason].label}
                  {sending === reason && <Loader2 size={13} className="animate-spin shrink-0" aria-hidden="true" />}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setPicking(false)}
              disabled={sending !== null}
              className="text-f9 font-mono tracking-tag uppercase underline underline-offset-4 text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              Never mind
            </button>
          </>
        ) : (
          <>
            <p className="text-f10 font-mono text-muted-light dark:text-muted-dark leading-relaxed">
              Nobody has told {order.customerName || 'them'} about this refund yet.
            </p>

            <button
              type="button"
              onClick={() => setPicking(true)}
              className="btn-shimmer relative overflow-hidden w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-light dark:bg-primary-dark text-white hover:bg-secondary-light dark:hover:bg-secondary-dark transition-colors text-f10 font-mono tracking-eyebrow uppercase font-black focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              <Mail size={13} aria-hidden="true" />
              Email about the refund
            </button>
          </>
        )}
      </div>
    </section>
  )
}
