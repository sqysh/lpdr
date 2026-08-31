'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { RefreshCw, CheckCircle } from 'lucide-react'
import { pusherClient } from 'lib/pusher/pusher-client'
import { MigrationGridEffect } from './MigrationScanEffect'

export function MigrationBanner({ initiallyPending }: { initiallyPending: boolean }) {
  const [pending, setPending] = useState(initiallyPending)
  const [justCompleted, setJustCompleted] = useState(false)
  const [visible, setVisible] = useState(initiallyPending)
  const router = useRouter()
  const { data: session } = useSession()
  const userId = session?.user?.id

  useEffect(() => {
    if (!userId || !pending) return

    const channel = pusherClient.subscribe(`user-${userId}`)

    channel.bind('migration-complete', () => {
      setPending(false)
      setJustCompleted(true)
      router.refresh()
    })

    return () => {
      channel.unbind_all()
      pusherClient.unsubscribe(`user-${userId}`)
    }
  }, [userId, pending, router])

  useEffect(() => {
    if (!justCompleted) return

    const timeout = setTimeout(() => {
      setVisible(false)
    }, 4000)

    return () => clearTimeout(timeout)
  }, [justCompleted])

  if (!visible) return null

  if (justCompleted) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 border border-emerald-500/40 bg-emerald-500/5 mb-6 transition-opacity duration-500">
        <MigrationGridEffect trigger={justCompleted} />
        <CheckCircle
          className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
          aria-hidden="true"
        />
        <div>
          <p className="text-xs font-mono font-bold text-text-light dark:text-text-dark">
            History restored
          </p>
          <p className="text-[11px] font-mono text-muted-light dark:text-muted-dark">
            Your past orders, donations, and auction activity are now up to date.
          </p>
        </div>
      </div>
    )
  }

  if (!pending) return null

  return (
    <div className="flex items-center gap-3 px-4 py-3 border border-primary-light/30 dark:border-primary-dark/30 bg-primary-light/5 dark:bg-primary-dark/5 mb-6">
      <RefreshCw
        className="w-4 h-4 text-primary-light dark:text-primary-dark animate-spin shrink-0"
        aria-hidden="true"
      />
      <div>
        <p className="text-xs font-mono font-bold text-text-light dark:text-text-dark">
          Restoring your history
        </p>
        <p className="text-[11px] font-mono text-muted-light dark:text-muted-dark">
          We&apos;re pulling in your past orders, donations, and auction activity from the old site.
          This usually takes just a moment.
        </p>
      </div>
    </div>
  )
}
