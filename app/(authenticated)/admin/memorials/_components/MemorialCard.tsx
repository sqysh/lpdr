import { formatDate } from 'lib/utils/date.utils'
import { updateMemorialStatus } from 'lib/actions/admin/memorial/updateMemorialStatus'
import { updateMemorial } from 'lib/actions/admin/memorial/updateMemorial'
import { Check, EyeOff, ImageOff, Loader2, Pencil, Undo2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import Image from 'next/image'
import { formatMoney } from 'lib/utils/currency.utils'
import Link from 'next/link'
import { MemorialFilter } from 'lib/constants/memorial.constants'
import { AdminMemorial } from 'types/memorial.types'
import { btnPrimary, btnQuiet, isExpired, tabOf } from '../_lib'

type Mode = 'view' | 'hide' | 'edit' | 'removePhoto'

const PILL: Record<MemorialFilter | 'EXPIRED', string> = {
  PENDING: 'text-amber-600 dark:text-amber-400 border-amber-600/40 dark:border-amber-400/40',
  APPROVED: 'text-emerald-600 dark:text-emerald-400 border-emerald-600/40 dark:border-emerald-400/40',
  HIDDEN: 'text-muted-light dark:text-muted-dark border-border-light dark:border-border-dark',
  EXPIRED: 'text-muted-light dark:text-muted-dark border-border-light dark:border-border-dark'
}

const PILL_LABEL: Record<MemorialFilter | 'EXPIRED', string> = {
  PENDING: 'Pending',
  APPROVED: 'Live',
  HIDDEN: 'Hidden',
  EXPIRED: 'Expired'
}

const inputClass =
  'w-full px-3 py-2 text-sm border border-border-light dark:border-border-dark bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark focus:outline-none focus-visible:border-primary-light dark:focus-visible:border-primary-dark'

export function MemorialCard({ memorial: m }: { memorial: AdminMemorial }) {
  const [mode, setMode] = useState<Mode>('view')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [hiddenReason, setHiddenReason] = useState('')
  const [edit, setEdit] = useState({
    dogName: m.dogName,
    message: m.message ?? '',
    donorDisplayName: m.donorDisplayName ?? '',
    showDonorName: m.showDonorName
  })

  const pill = m.status === 'APPROVED' && isExpired(m) ? 'EXPIRED' : tabOf(m)

  const run = (action: () => Promise<{ success: boolean; error?: string | null }>) => {
    setError(null)
    startTransition(async () => {
      const result = await action()
      if (result.success) setMode('view')
      else setError(result.error ?? 'Something went wrong. Please try again.')
    })
  }

  const setStatus = (status: 'APPROVED' | 'PENDING') => run(() => updateMemorialStatus({ id: m.id, status }))
  const hide = () => run(() => updateMemorialStatus({ id: m.id, status: 'HIDDEN', hiddenReason: hiddenReason.trim() || undefined }))

  const saveEdit = () =>
    run(() =>
      updateMemorial({
        id: m.id,
        dogName: edit.dogName,
        message: edit.message.trim() || null,
        donorDisplayName: edit.donorDisplayName.trim() || null,
        showDonorName: edit.showDonorName,
        removePhoto: false
      })
    )

  const removePhoto = () =>
    run(() =>
      updateMemorial({
        id: m.id,
        dogName: m.dogName,
        message: m.message,
        donorDisplayName: m.donorDisplayName,
        showDonorName: m.showDonorName,
        removePhoto: true
      })
    )

  return (
    <li className="flex flex-col md:flex-row border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
      <div className="md:w-80 shrink-0 border-b md:border-b-0 md:border-r border-border-light dark:border-border-dark">
        {m.status === 'HIDDEN' ? (
          <div className="aspect-3/2 flex flex-col items-center justify-center gap-2 text-muted-light dark:text-muted-dark">
            <EyeOff className="w-5 h-5" aria-hidden="true" />
            <span className="text-[10px] font-mono tracking-eyebrow uppercase">Hidden from the wall</span>
          </div>
        ) : (
          <Image
            src={`/api/memorial-art/${m.id}?v=${new Date(m.updatedAt).getTime()}`}
            alt={`Memorial card for ${m.dogName}`}
            width={960}
            height={640}
            unoptimized
            className="w-full h-auto"
          />
        )}
      </div>

      <div className="flex-1 min-w-0 p-4 sm:p-5 space-y-4">
        <div className="flex items-start gap-4">
          {m.photoUrl ? (
            <a
              href={m.photoUrl}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              <Image
                src={m.photoUrl}
                alt={`Photo of ${m.dogName}, opens full size`}
                width={128}
                height={128}
                sizes="64px"
                className="w-16 h-16 object-cover border border-border-light dark:border-border-dark"
              />
            </a>
          ) : (
            <div className="w-16 h-16 shrink-0 flex items-center justify-center border border-dashed border-border-light dark:border-border-dark text-[9px] font-mono uppercase text-muted-light dark:text-muted-dark">
              No photo
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-quicksand text-lg font-bold text-text-light dark:text-text-dark wrap-break-word">{m.dogName}</h2>
              <span className={`px-2 py-0.5 border text-[9px] font-mono tracking-eyebrow uppercase ${PILL[pill]}`}>{PILL_LABEL[pill]}</span>
            </div>
            <p className="text-xs text-muted-light dark:text-muted-dark">
              {m.showDonorName && m.donorDisplayName ? `Loved by ${m.donorDisplayName}` : 'Donor name not shown'}
            </p>
            <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-1">
              Received {formatDate(m.createdAt, true)}
              {m.approvedAt && ` · Approved ${formatDate(m.approvedAt, true)}`}
              {m.expiresAt && ` · ${isExpired(m) ? 'Expired' : 'Up until'} ${formatDate(m.expiresAt)}`}
            </p>
          </div>
        </div>

        {m.message && (
          <p className="text-sm text-text-light dark:text-text-dark leading-relaxed whitespace-pre-wrap wrap-break-word border-l-2 border-border-light dark:border-border-dark pl-3">
            {m.message}
          </p>
        )}

        {m.status === 'HIDDEN' && m.hiddenReason && (
          <p className="text-[11px] font-mono text-muted-light dark:text-muted-dark">Hidden because: {m.hiddenReason}</p>
        )}

        {m.order && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-muted-light dark:text-muted-dark">
            <span className="font-bold text-text-light dark:text-text-dark tabular-nums">{formatMoney(m.order.totalAmount)}</span>
            <span className="truncate">
              {m.order.customerName || 'Unknown donor'}
              {m.order.customerEmail && ` · ${m.order.customerEmail}`}
            </span>
            <Link
              href={`/admin/transactions/${m.order.id}`}
              className="text-primary-light dark:text-primary-dark hover:underline underline-offset-2"
            >
              #{m.order.id.slice(-8)}
            </Link>
          </div>
        )}

        {mode === 'hide' && (
          <div className="space-y-2">
            <label
              htmlFor={`hide-${m.id}`}
              className="block text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark"
            >
              Reason (only admins see this)
            </label>
            <input
              id={`hide-${m.id}`}
              value={hiddenReason}
              onChange={(e) => setHiddenReason(e.target.value)}
              maxLength={300}
              placeholder="For example: duplicate, or the photo isn't a dog"
              className={inputClass}
            />
          </div>
        )}

        {mode === 'edit' && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label
                htmlFor={`name-${m.id}`}
                className="block text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark"
              >
                Dog&apos;s name
              </label>
              <input
                id={`name-${m.id}`}
                value={edit.dogName}
                onChange={(e) => setEdit({ ...edit, dogName: e.target.value })}
                maxLength={60}
                className={inputClass}
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor={`donor-${m.id}`}
                className="block text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark"
              >
                Name shown for the family
              </label>
              <input
                id={`donor-${m.id}`}
                value={edit.donorDisplayName}
                onChange={(e) => setEdit({ ...edit, donorDisplayName: e.target.value })}
                maxLength={80}
                className={inputClass}
              />
            </div>
            <label className="sm:col-span-2 flex items-center gap-2 text-sm text-text-light dark:text-text-dark cursor-pointer">
              <input
                type="checkbox"
                checked={edit.showDonorName}
                onChange={(e) => setEdit({ ...edit, showDonorName: e.target.checked })}
                className="w-4 h-4 accent-primary-light dark:accent-primary-dark"
              />
              Show the family&apos;s name on the wall
            </label>
            {(m.message || edit.message) && (
              <div className="sm:col-span-2 space-y-1">
                <label
                  htmlFor={`message-${m.id}`}
                  className="block text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark"
                >
                  Message
                </label>
                <textarea
                  id={`message-${m.id}`}
                  value={edit.message}
                  onChange={(e) => setEdit({ ...edit, message: e.target.value })}
                  maxLength={500}
                  rows={3}
                  className={inputClass}
                />
              </div>
            )}
          </div>
        )}

        {mode === 'removePhoto' && (
          <p className="text-sm text-text-light dark:text-text-dark">
            Remove {m.dogName}&apos;s photo? The memorial stays up without it, and the family can&apos;t add it back themselves.
          </p>
        )}

        {error && (
          <p role="alert" className="text-[11px] font-mono text-red-500 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {isPending && <Loader2 className="w-4 h-4 animate-spin text-primary-light dark:text-primary-dark" aria-label="Saving" />}

          {mode === 'view' && (
            <>
              {m.status !== 'APPROVED' && (
                <button type="button" disabled={isPending} onClick={() => setStatus('APPROVED')} className={btnPrimary}>
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  {m.status === 'HIDDEN' ? 'Restore to wall' : 'Approve'}
                </button>
              )}
              {m.status !== 'HIDDEN' && (
                <button type="button" disabled={isPending} onClick={() => setMode('hide')} className={btnQuiet}>
                  <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                  Hide
                </button>
              )}
              {m.status === 'APPROVED' && (
                <button type="button" disabled={isPending} onClick={() => setStatus('PENDING')} className={btnQuiet}>
                  <Undo2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Back to review
                </button>
              )}
              <button type="button" disabled={isPending} onClick={() => setMode('edit')} className={btnQuiet}>
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                Edit
              </button>
              {m.photoUrl && (
                <button type="button" disabled={isPending} onClick={() => setMode('removePhoto')} className={btnQuiet}>
                  <ImageOff className="w-3.5 h-3.5" aria-hidden="true" />
                  Remove photo
                </button>
              )}
            </>
          )}

          {mode === 'hide' && (
            <>
              <button type="button" disabled={isPending} onClick={hide} className={btnPrimary}>
                Hide memorial
              </button>
              <button type="button" disabled={isPending} onClick={() => setMode('view')} className={btnQuiet}>
                Cancel
              </button>
            </>
          )}

          {mode === 'edit' && (
            <>
              <button type="button" disabled={isPending || !edit.dogName.trim()} onClick={saveEdit} className={btnPrimary}>
                Save changes
              </button>
              <button type="button" disabled={isPending} onClick={() => setMode('view')} className={btnQuiet}>
                Cancel
              </button>
            </>
          )}

          {mode === 'removePhoto' && (
            <>
              <button type="button" disabled={isPending} onClick={removePhoto} className={btnPrimary}>
                Remove photo
              </button>
              <button type="button" disabled={isPending} onClick={() => setMode('view')} className={btnQuiet}>
                Keep it
              </button>
            </>
          )}
        </div>
      </div>
    </li>
  )
}
