import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import Pusher from 'pusher-js'
import { setAdoptionFeeCookie } from '../actions/_infra/setAdoptionFeeCookie'

type OrderCreatedEvent = {
  type: string
  orderId?: string
  adoptionFeeId?: string
}

type OrderFailedEvent = {
  error?: string
}

export async function setupPusherListenerOneTime(
  channelId: string,
  router: AppRouterInstance
): Promise<void> {
  let processingStatus = 'processing'
  let hasProcessed = false

  return new Promise((resolve, reject) => {
    if (!channelId) return

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER
    })
    const channel = pusher.subscribe(`payment-${channelId}`)

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

      const finish = async () => {
        if (data.type === 'ADOPTION_FEE') {
          if (data.adoptionFeeId) await setAdoptionFeeCookie(data.adoptionFeeId)
          router.push('/adopt/application?ref=?tab=orders')
        } else {
          router.push(`/order-confirmation/${data.orderId}?ref=new`)
        }
        channel.unbind_all()
        pusher.unsubscribe(`payment-${channelId}`)
        resolve()
      }

      finish().catch(reject)
    })

    channel.bind('order-failed', (data: OrderFailedEvent) => {
      clearTimeout(timeout)
      processingStatus = 'failed'
      channel.unbind_all()
      pusher.unsubscribe(`payment-${channelId}`)
      reject(new Error(data.error || 'Order processing failed'))
    })
  })
}
