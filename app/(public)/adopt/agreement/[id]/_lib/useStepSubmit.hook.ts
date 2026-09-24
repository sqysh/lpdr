// Every step reloads the page data when it succeeds, and when the agreement changed underneath them,

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { ActionResult } from 'types/action.types'

// so what the adopter sees is always what they're about to sign
export function useStepSubmit() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  // The next step only appears once the server sends back the updated agreement, so the button keeps
  // spinning until then rather than stopping the moment the action returns
  const [isRefreshing, startRefresh] = useTransition()

  const run = async (action: () => Promise<ActionResult<unknown>>) => {
    setError(null)
    const result = await action()

    if (!result.success) {
      setError(result.error ?? 'Something went wrong. Please try again.')
      if (result.error?.includes('just updated')) startRefresh(() => router.refresh())
      return
    }

    startRefresh(() => router.refresh())
  }

  return { error, run, isRefreshing }
}
