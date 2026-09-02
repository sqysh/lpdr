'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Copy, RefreshCw } from 'lucide-react'
import { Role } from '@prisma/client'
import { rotateBypassCode } from 'lib/actions/admin/adoption-fee/rotateBypassCode'
import { formatDate } from 'lib/utils/date.utils'

export function BypassCode({
  code,
  rotatesAt,
  role
}: {
  code: string | null
  rotatesAt: string | null
  role: Role
}) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [rotating, setRotating] = useState(false)

  if (!code) return null

  const isSuperUser = role === Role.SUPER_USER

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard unavailable — nothing useful to show here
    }
  }

  const handleRotate = async () => {
    setRotating(true)
    const result = await rotateBypassCode()
    setRotating(false)
    if (result.success) router.refresh()
  }

  return (
    <div className="px-4 py-3 border-t border-border-light dark:border-border-dark">
      <p className="font-mono text-[9px] tracking-[0.25em] uppercase text-muted-light/70 dark:text-muted-dark/70 mb-1.5">
        Bypass Code
      </p>

      <div className="flex items-center gap-1.5">
        <span className="font-mono text-sm font-bold tracking-[0.05em] text-primary-light dark:text-primary-dark flex-1 truncate">
          {code}
        </span>

        <button
          type="button"
          onClick={copyCode}
          aria-label={`Copy adoption fee bypass code ${code}`}
          className="shrink-0 p-1 text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          {copied ? (
            <Check className="w-3 h-3" aria-hidden="true" />
          ) : (
            <Copy className="w-3 h-3" aria-hidden="true" />
          )}
        </button>

        {isSuperUser && (
          <button
            type="button"
            onClick={handleRotate}
            disabled={rotating}
            aria-label="Rotate bypass code now"
            className="shrink-0 p-1 text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            <RefreshCw className={`w-3 h-3 ${rotating ? 'animate-spin' : ''}`} aria-hidden="true" />
          </button>
        )}
      </div>

      {rotatesAt && (
        <p className="font-mono text-[9px] text-muted-light/70 dark:text-muted-dark/70 mt-1">
          Rotates {formatDate(rotatesAt)}
        </p>
      )}
    </div>
  )
}
