import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import Pusher from 'pusher-js'

type OrderCreatedEvent = {
  orderId?: string
}

type OrderFailedEvent = {
  error?: string
}

export async function setupPusherListenerRecurring(
  subscriptionResult: { subscriptionId: string },
  router: AppRouterInstance
): Promise<void> {
  let processingStatus = 'processing'
  let hasProcessed = false

  return new Promise((resolve, reject) => {
    const channelId = `payment-${subscriptionResult.subscriptionId}`

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER
    })
    const channel = pusher.subscribe(channelId)

    const timeout = setTimeout(() => {
      if (processingStatus === 'processing') {
        processingStatus = 'failed'
        reject(new Error('Order processing timeout. Please check your email for confirmation.'))
      }
    }, 10000)

    channel.bind('order-created', (data: OrderCreatedEvent) => {
      if (hasProcessed) return
      hasProcessed = true
      clearTimeout(timeout)
      processingStatus = 'success'

      router.push(`/order-confirmation/${data.orderId}?ref=new`)
      channel.unbind_all()
      pusher.unsubscribe(channelId)
      resolve()
    })

    channel.bind('order-failed', (data: OrderFailedEvent) => {
      clearTimeout(timeout)
      processingStatus = 'failed'
      channel.unbind_all()
      pusher.unsubscribe(channelId)
      reject(new Error(data.error || 'Order processing failed'))
    })
  })
}
