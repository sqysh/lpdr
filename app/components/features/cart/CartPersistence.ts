'use client'

import { hydrateCart } from 'lib/store/slices/cartSlice'
import { store } from 'lib/store/store'
import { useEffect } from 'react'

const KEY = 'lpdr-cart'

export function CartPersistence() {
  useEffect(() => {
    // hydrate on mount
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) store.dispatch(hydrateCart(JSON.parse(raw)))
    } catch {}

    // write-through on every cart change
    let prev = store.getState().cart
    const unsub = store.subscribe(() => {
      const next = store.getState().cart
      if (next !== prev) {
        prev = next
        try {
          localStorage.setItem(
            KEY,
            JSON.stringify({ items: next.items, lastUpdated: next.lastUpdated })
          )
        } catch {}
      }
    })
    return unsub
  }, [])

  return null
}
