'use client'

import { useState, type ReactNode } from 'react'
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react'

type ActionResult = { success: boolean; error?: string }

interface DangerZoneProps {
  onDelete: () => Promise<ActionResult>
  label: string
  description?: ReactNode
  confirmText?: ReactNode
  onDeleted?: () => void
  title?: string
  buttonText?: string
}

export function DangerZone({
  onDelete,
  label,
  description,
  confirmText,
  onDeleted,
  title = 'Danger Zone',
  buttonText = 'Delete'
}: DangerZoneProps) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)

    const result = await onDelete()

    if (!result.success) {
      setDeleting(false)
      setError(result.error ?? 'Failed to delete')
      return
    }

    onDeleted?.()
  }

  return (
    <section className="border border-red-500/30 dark:border-red-400/30 bg-red-500/5 dark:bg-red-400/5">
      <div className="px-4 py-2.5 border-b border-red-500/30 dark:border-red-400/30 flex items-center gap-2">
        <AlertTriangle
          className="w-3 h-3 text-red-500 dark:text-red-400 shrink-0"
          aria-hidden="true"
        />
        <h3 className="text-[9px] font-mono tracking-[0.2em] uppercase text-red-500 dark:text-red-400">
          {title}
        </h3>
      </div>

      <div className="px-4 py-3">
        {confirming ? (
          <div className="space-y-2.5">
            <p className="text-[11px] font-mono text-text-light dark:text-text-dark leading-relaxed">
              {confirmText ?? `${label}? This can't be undone.`}
            </p>
            {error && (
              <p className="text-[10px] font-mono text-red-500 dark:text-red-400">{error}</p>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-red-500 dark:bg-red-400 text-white dark:text-black px-4 py-2 text-[10px] font-mono uppercase tracking-[0.16em] hover:opacity-90 transition-opacity disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:focus-visible:ring-red-400"
              >
                {deleting ? (
                  <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 className="w-3 h-3" aria-hidden="true" />
                )}
                Confirm delete
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirming(false)
                  setError(null)
                }}
                disabled={deleting}
                className="px-4 py-2 text-[10px] font-mono uppercase tracking-[0.16em] text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-mono text-text-light dark:text-text-dark">{label}</p>
              {description && (
                <p className="text-[9px] font-mono text-muted-light dark:text-muted-dark mt-0.5">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="shrink-0 inline-flex items-center gap-2 border border-red-500/40 dark:border-red-400/40 text-red-500 dark:text-red-400 px-4 py-2 text-[10px] font-mono uppercase tracking-[0.16em] hover:bg-red-500/10 dark:hover:bg-red-400/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:focus-visible:ring-red-400"
            >
              <Trash2 className="w-3 h-3" aria-hidden="true" />
              {buttonText}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
