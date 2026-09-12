export type PaymentState = {
  selectedCardId: string | null
  useNewCard: boolean
  loading: boolean
  error: string | null
  saveCard: boolean
  coverFees: boolean
  processingFee: number
  finalAmount: number
  isValid: boolean
}

export type PaymentHandlers = {
  onSelectCard: (id: string) => void
  onUseNewCard: () => void
  onUseSavedCard: () => void
  onCardChange: (state: { complete: boolean; error: string | null }) => void
  onSaveCardToggle: () => void
  onCoverFeesChange: (value: boolean) => void
  onSubmit: (e: { preventDefault: () => void }) => void
}
