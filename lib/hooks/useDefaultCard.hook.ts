import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { IPaymentMethod } from 'types/_payment-method.types'

export function useDefaultCard(savedCards: IPaymentMethod[], setSelectedCardId: (id: string) => void) {
  const { status } = useSession()

  useEffect(() => {
    if (status !== 'authenticated') return
    const defaultCard = savedCards.find((c) => c.isDefault)
    if (defaultCard) setSelectedCardId(defaultCard.stripePaymentId)
    // setSelectedCardId is a useState setter — stable by guarantee, listed to satisfy exhaustive-deps
  }, [savedCards, status, setSelectedCardId])
}
