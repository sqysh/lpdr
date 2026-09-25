'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

/**
 * For pages whose signed-in state came from the server when they loaded. If the session ends while the
 * page is open, signed out from the menu or in another tab, the page is reloaded from the server so it
 * shows the signed-out version instead of a stale name and a payment that can't go through.
 */
export function useRefreshOnSignOut(loadedSignedIn: boolean) {
  const router = useRouter()
  const { status } = useSession()

  useEffect(() => {
    if (loadedSignedIn && status === 'unauthenticated') router.refresh()
  }, [loadedSignedIn, status, router])
}
