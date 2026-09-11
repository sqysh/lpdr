export type PaymentState = {
  cardComplete: boolean
  selectedCardId: string | null
  useNewCard: boolean
  saveCard: boolean
  coverFees: boolean
  loading: boolean
  error: string | null
}
