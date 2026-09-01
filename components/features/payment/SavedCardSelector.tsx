import { CreditCard, CheckCircle, Plus, ArrowLeft } from 'lucide-react'
import { IPaymentMethod } from 'types/_payment-method.types'

type Props = {
  savedCards: IPaymentMethod[]
  selectedCardId: string | null
  useNewCard: boolean
  onSelectCard: (stripePaymentId: string) => void
  onUseNewCard: () => void
  onUseSavedCard: () => void
}

const labelClass = `block text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-2`

export function SavedCardSelector({
  savedCards,
  selectedCardId,
  useNewCard,
  onSelectCard,
  onUseNewCard,
  onUseSavedCard
}: Props) {
  if (!savedCards?.length) return null

  return (
    <div>
      <label className={labelClass}>Payment Method</label>

      {!useNewCard ? (
        <div className="space-y-2">
          {savedCards.map((card) => (
            <button
              key={card.stripePaymentId}
              type="button"
              onClick={() => onSelectCard(card.stripePaymentId)}
              aria-pressed={selectedCardId === card.stripePaymentId}
              className={`w-full flex items-center justify-between px-3.5 py-3 border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark
                ${
                  selectedCardId === card.stripePaymentId
                    ? 'border-primary-light dark:border-primary-dark bg-primary-light/5 dark:bg-primary-dark/5'
                    : 'border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark hover:border-primary-light dark:hover:border-primary-dark'
                }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-muted-light dark:text-muted-dark shrink-0" aria-hidden="true" />
                <div className="text-left">
                  <p className="text-xs font-mono text-text-light dark:text-text-dark capitalize">
                    {card.cardBrand} •••• {card.cardLast4}
                  </p>
                  <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-0.5">
                    Expires {card.cardExpMonth.toString().padStart(2, '0')}/{card.cardExpYear}
                  </p>
                </div>
              </div>
              {selectedCardId === card.stripePaymentId && (
                <CheckCircle
                  className="w-4 h-4 text-primary-light dark:text-primary-dark shrink-0"
                  aria-hidden="true"
                />
              )}
            </button>
          ))}

          <button
            type="button"
            onClick={onUseNewCard}
            className="w-full flex items-center gap-2 px-3.5 py-3 border border-dashed border-border-light dark:border-border-dark hover:border-primary-light dark:hover:border-primary-dark text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark text-[10px] font-mono tracking-[0.2em] uppercase transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            Use a different card
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onUseSavedCard}
          className="flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none"
        >
          <ArrowLeft className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          Use a saved card
        </button>
      )}
    </div>
  )
}
