import { useEffect } from 'react'
import { IPaymentMethod } from 'types/payment-method.types'

export function useDefaultCard(savedCards: IPaymentMethod[], isAuthed: boolean, setSelectedCardId: (id: string) => void) {
  useEffect(() => {
    if (!isAuthed) return

    const defaultCard = savedCards.find((c) => c.isDefault)
    if (defaultCard) setSelectedCardId(defaultCard.stripePaymentId)
  }, [savedCards, setSelectedCardId, isAuthed])
}
