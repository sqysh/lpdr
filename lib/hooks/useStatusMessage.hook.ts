'use client'

import { Status } from 'components/_primitives/StatusMessage'
import { useCallback, useEffect, useRef, useState } from 'react'

export function useStatusMessage(duration = 6000) {
  const [status, setStatus] = useState<Status | null>(null)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flash = useCallback(
    (next: Status) => {
      if (timeout.current) clearTimeout(timeout.current)
      setStatus(next)
      timeout.current = setTimeout(() => setStatus(null), duration)
    },
    [duration]
  )

  const clearStatus = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current)
    setStatus(null)
  }, [])

  useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current)
    },
    []
  )

  return { status, flash, clearStatus }
}
