import { useState, useEffect } from 'react'

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

const zero = { days: 0, hours: 0, minutes: 0, seconds: 0, done: false }

export function useCountdown(endDate: Date) {
  const [time, setTime] = useState(zero)

  useEffect(() => {
    const id = setInterval(() => setTime(calcTime(endDate)), 1000)
    return () => clearInterval(id)
  }, [endDate])

  return time
}
