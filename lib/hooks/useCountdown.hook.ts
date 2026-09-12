import { useSyncExternalStore } from 'react'

function calcTime(endDate: Date) {
  const diff = new Date(endDate).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    done: false
  }
}

const subscribeToSecond = (onChange: () => void) => {
  const id = setInterval(onChange, 1000)
  return () => clearInterval(id)
}

/**
 * `ready` is false during SSR and the first client render, since the server
 * cannot compute a countdown and rendering zeros would flash a wrong value.
 */
export function useCountdown(endDate: Date) {
  const now = useSyncExternalStore(
    subscribeToSecond,
    () => Math.floor(Date.now() / 1000),
    () => null
  )

  if (now === null) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: false, ready: false }

  return { ...calcTime(endDate), ready: true }
}
