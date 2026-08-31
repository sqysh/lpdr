import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { setupPusherListenerOneTime } from '../pusher/setupPusherListenerOneTime'
import { setupPusherListenerRecurring } from '../pusher/setupPusherListenerRecurring'

export function usePaymentProcessor() {
  const router = useRouter()
  const session = useSession()

  return {
    setupPusherListenerOneTime: () => setupPusherListenerOneTime(session.data.user.id!, router),
    setupPusherListenerRecurring: (subscriptionResult: { subscriptionId: string }) =>
      setupPusherListenerRecurring(subscriptionResult, router)
  }
}
