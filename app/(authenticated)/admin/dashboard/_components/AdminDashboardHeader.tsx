import { motion } from 'framer-motion'
import { rotateBypassCode } from 'lib/actions/admin/adoption-fee/rotateBypassCode'
import { fadeUp } from 'lib/constants/motion.constants'
import { Check, Copy, RefreshCw } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function AdminDashboardHeader({ data }) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [rotating, setRotating] = useState(false)

  const session = useSession()
  const isSuperuser = session.data?.user?.role === 'SUPER_USER'

  const copyCode = async () => {
    if (!data.bypassCode) return
    try {
      await navigator.clipboard.writeText(data.bypassCode)
    } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const handleRotate = async () => {
    setRotating(true)
    const result = await rotateBypassCode()
    setRotating(false)
    if (result.success) {
      router.refresh()
    }
  }

  return (
    <motion.header
      variants={fadeUp}
      initial="hidden"
      animate="show"
      custom={0}
      className="border-b border-border-light dark:border-border-dark px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4"
    >
      <div className="flex items-baseline gap-2">
        <h1 className="font-mono text-[11px] tracking-[0.2em] uppercase text-text-light dark:text-text-dark">
          Dashboard
        </h1>
        <span className="font-mono text-[9px] tracking-widest text-muted-light dark:text-muted-dark">
          · Little Paws all time
        </span>
      </div>

      {data.bypassCode && (
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-mono text-[9px] tracking-widest uppercase text-muted-light dark:text-muted-dark hidden md:inline">
            Bypass
          </span>
          <span className="font-mono text-xs font-bold tracking-[0.05em] text-primary-light dark:text-primary-dark">
            {data.bypassCode}
          </span>

          <button
            type="button"
            onClick={copyCode}
            aria-label={`Copy adoption fee bypass code ${data.bypassCode}`}
            className="text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark rounded"
          >
            {copied ? (
              <Check className="w-3 h-3" aria-hidden="true" />
            ) : (
              <Copy className="w-3 h-3" aria-hidden="true" />
            )}
          </button>

          {isSuperuser && (
            <button
              type="button"
              onClick={handleRotate}
              disabled={rotating}
              aria-label="Rotate bypass code now"
              className="text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark rounded"
            >
              <RefreshCw
                className={`w-3 h-3 ${rotating ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
            </button>
          )}

          {data.bypassCodeRotatesAt && (
            <span className="font-mono text-[9px] text-muted-light/70 dark:text-muted-dark/70 hidden lg:inline ml-1">
              rotates{' '}
              {new Date(data.bypassCodeRotatesAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                timeZone: 'America/New_York'
              })}
            </span>
          )}
        </div>
      )}
    </motion.header>
  )
}
