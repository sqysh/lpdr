'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { toggleWatch } from 'lib/actions/user/auction/toggleWatch'
import { useAuctionUiStore } from 'stores/auction-ui.store'

export function WatchButton({
  itemId,
  itemName,
  initiallyWatching,
  isAuthed,
  signInHref
}: {
  itemId: string
  itemName: string
  initiallyWatching: boolean
  isAuthed: boolean
  signInHref: string
}) {
  const router = useRouter()
  const openSignInModal = useAuctionUiStore((s) => s.openSignInModal)
  const [watching, setWatching] = useState(initiallyWatching)
  const [, startRefresh] = useTransition()

  const onClick = async () => {
    if (!isAuthed) return openSignInModal(signInHref, 'watch')

    // Flipped at once so the heart responds to the tap; put back if the save fails
    const next = !watching
    setWatching(next)
    const result = await toggleWatch(itemId)

    if (!result.success) {
      setWatching(!next)
      return
    }

    // Brings the Watching filter's count up to date
    startRefresh(() => router.refresh())
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={watching}
      aria-label={watching ? `Stop watching ${itemName}` : `Watch ${itemName}`}
      className="absolute top-2.5 right-2.5 z-10 w-10 h-10 flex items-center justify-center bg-bg-light/90 dark:bg-bg-dark/90 backdrop-blur-sm border border-border-light dark:border-border-dark hover:border-primary-light dark:hover:border-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
    >
      <Heart
        size={16}
        aria-hidden="true"
        className={
          watching
            ? 'fill-primary-light text-primary-light dark:fill-primary-dark dark:text-primary-dark'
            : 'text-muted-light dark:text-muted-dark'
        }
      />
    </button>
  )
}
