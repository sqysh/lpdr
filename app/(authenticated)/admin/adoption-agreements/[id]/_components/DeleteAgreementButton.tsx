'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deleteAdoptionAgreement } from 'lib/actions/admin/adoption-agreement/deleteAdoptionAgreement'

export function DeleteAgreementButton({ agreementId }: { agreementId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const handleDelete = () =>
    startTransition(async () => {
      const result = await deleteAdoptionAgreement(agreementId)
      if (!result.success) {
        setError(result.error)
        setConfirming(false)
        return
      }
      router.push('/admin/adoption-agreements')
    })

  return (
    <div className="space-y-2">
      {confirming ? (
        <div className="border border-red-500/40 bg-red-500/5 px-4 py-3 space-y-3">
          <p className="text-xs font-nunito text-text-light dark:text-text-dark">
            Delete this agreement and its order? This can&apos;t be undone.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending}
              className="px-3 py-2 bg-red-600 text-white font-mono text-[10px] tracking-tag uppercase disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              {pending ? 'Deleting…' : 'Delete'}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={pending}
              className="px-3 py-2 font-mono text-[10px] tracking-tag uppercase text-muted-light dark:text-muted-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            setError(null)
            setConfirming(true)
          }}
          className="inline-flex items-center gap-2 font-mono text-[10px] tracking-tag uppercase text-red-600 dark:text-red-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          Delete agreement
        </button>
      )}

      {error && (
        <p role="alert" className="text-[11px] font-mono text-red-500 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}
