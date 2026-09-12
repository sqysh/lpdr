import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import Pusher from 'pusher-js'

type OrderCreatedEvent = {
  type?: string
  orderId?: string
}

type OrderFailedEvent = {
  error?: string
}

// The webhook has to create records and send mail, so this waits longer than
// feels necessary. A timeout means the payment very likely succeeded and we
// lost the notification, not that anything failed.
const TIMEOUT_MS = 30_000

const TIMEOUT_MESSAGE =
  'This is taking longer than expected. Your payment may have gone through, so please check your email before trying again.'

/** Waits for the webhook to confirm, then navigates. Resolves once, cleans up on every path. */
export function waitForOrder(channelKey: string, router: AppRouterInstance): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!channelKey) {
      reject(new Error('Missing payment channel'))
      return
    }

    const key = process.env.NEXT_PUBLIC_PUSHER_KEY
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER

    if (!key || !cluster) {
      reject(new Error('Payment updates are unavailable. Please check your email for confirmation.'))
      return
    }

    const channelName = `payment-${channelKey}`
    const pusher = new Pusher(key, { cluster })
    const channel = pusher.subscribe(channelName)

    let settled = false

    const cleanup = () => {
      clearTimeout(timeout)
      channel.unbind_all()
      pusher.unsubscribe(channelName)
      pusher.disconnect()
    }

    const succeed = (path: string) => {
      if (settled) return
      settled = true
      cleanup()
      router.push(path)
      resolve()
    }

    const fail = (message: string) => {
      if (settled) return
      settled = true
      cleanup()
      reject(new Error(message))
    }

    const timeout = setTimeout(() => fail(TIMEOUT_MESSAGE), TIMEOUT_MS)

    channel.bind('order-created', (data: OrderCreatedEvent) => {
      // The adoption fee has no order to show, so it goes straight to the form
      if (data.type === 'ADOPTION_FEE') {
        succeed('/adopt/application?ref=orders')
        return
      }

      if (!data.orderId) {
        fail('Your payment went through but we could not open your confirmation. Please check your email.')
        return
      }

      succeed(`/order-confirmation/${data.orderId}?ref=new`)
    })

    channel.bind('order-failed', (data: OrderFailedEvent) => {
      fail(data.error || 'Order processing failed')
    })

    channel.bind('pusher:subscription_error', () => {
      fail('Could not connect for payment updates. Please check your email for confirmation.')
    })
  })
}
