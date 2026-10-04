// Resend allows 10 requests a second. Sends made in parallel (the auction close, reminders) are queued
// here and released one at a time, about 6 a second, so a burst can't be rejected
const GAP_MS = 160

let queue: Promise<unknown> = Promise.resolve()

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function throttled<T>(send: () => Promise<T>): Promise<T> {
  const result = queue.then(send)
  // The next send waits for this one plus the gap, whether this one succeeded or failed
  queue = result.then(
    () => wait(GAP_MS),
    () => wait(GAP_MS)
  )
  return result
}
