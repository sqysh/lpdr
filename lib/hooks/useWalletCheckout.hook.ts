'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getPusherClient, releaseChannel } from 'lib/pusher/pusher-client'
import { createPaymentIntent } from 'lib/actions/_stripe/createPaymentIntent'
import { useConfettiStore } from 'stores/confetti.store'

const TIMEOUT_MS = 15_000
const TIMEOUT_MESSAGE =
  'This is taking longer than expected. Your payment may have gone through, so please check your email before trying again.'

type IntentParams = Parameters<typeof createPaymentIntent>[0]

/**
 * The Apple Pay and Google Pay side of checkout: creates the intent the wallet confirms, and waits for the
 * webhook to announce the order. Listening starts before the intent is created, so a fast webhook can't
 * announce the order before anyone is subscribed
 */
export function useWalletCheckout(userId: string | null, onFailed: (message: string) => void) {
  const router = useRouter()
  const showConfetti = useConfettiStore((s) => s.show)
  const channelName = useRef<string | null>(null)
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stop = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current)
    timeout.current = null
    if (channelName.current) releaseChannel(channelName.current)
    channelName.current = null
  }, [])

  useEffect(() => stop, [stop])

  const listen = () => {
    if (!userId) return
    stop()

    const name = `payment-${userId}`
    const channel = getPusherClient().subscribe(name)
    channelName.current = name

    channel.bind('order-created', ({ orderId }: { orderId: string }) => {
      stop()
      showConfetti()
      router.push(`/order-confirmation/${orderId}?ref=new`)
    })

    channel.bind('order-failed', ({ error }: { error?: string }) => {
      stop()
      onFailed(error ?? 'Payment failed. Please try again.')
    })
  }

  const createWalletIntent = async (params: IntentParams): Promise<{ clientSecret: string } | { error: string }> => {
    listen()

    const result = await createPaymentIntent(params)
    if (!result.success || !result.data?.clientSecret) {
      stop()
      return { error: result.error ?? "Payment couldn't be started. Please try again." }
    }

    return { clientSecret: result.data.clientSecret }
  }

  // Called once the wallet payment is confirmed; from here it's the webhook's turn
  const waitForOrder = () => {
    timeout.current = setTimeout(() => {
      stop()
      onFailed(TIMEOUT_MESSAGE)
    }, TIMEOUT_MS)
  }

  return { createWalletIntent, waitForOrder, cancel: stop }
}
