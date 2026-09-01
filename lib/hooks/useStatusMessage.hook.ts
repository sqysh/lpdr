'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Status } from 'components/_primitives/StatusMessage'

export function useStatusMessage(duration = 6000) {
  const [status, setStatus] = useState<Status | null>(null)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current)
    }
  }, [])

  const flash = useCallback(
    (next: Status) => {
      if (timeout.current) clearTimeout(timeout.current)
      setStatus(next)
      timeout.current = setTimeout(() => setStatus(null), duration)
    },
    [duration]
  )

  const clear = useCallback(() => setStatus(null), [])

  return { status, flash, clear }
}
