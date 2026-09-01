import { ArrowLeft } from 'lucide-react'

export function PlanSummary({ setView, T, selectedTier, billing }) {
  return (
    <div className="lg:border-r border-border-dark px-6 sm:px-10 pt-12 sm:pt-16 pb-12 flex flex-col">
      <div className="lg:sticky lg:top-16">
        {/* Back */}
        <button
          type="button"
          onClick={() => setView('select')}
          className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase text-muted-dark hover:text-primary-dark transition-colors focus:outline-none focus-visible:underline mb-10"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          Change plan
        </button>

        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-4">
          <span className="block w-8 h-px bg-primary-dark" aria-hidden="true" />
          <p className="text-xs font-mono tracking-[0.2em] uppercase text-primary-dark">Memberships</p>
        </div>

        <h1 className="font-quicksand text-3xl sm:text-4xl font-black text-text-dark leading-tight mb-1">Complete your</h1>
        <p className="font-quicksand text-3xl sm:text-4xl font-light text-muted-dark leading-tight mb-8">subscription</p>

        {/* Plan card */}
        <div className="border border-border-dark p-5 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span
                className={`text-[9px] font-mono tracking-[0.2em] uppercase px-2 py-0.5 border border-border-dark ${T[selectedTier!.tier].labelClass}`}
              >
                {T[selectedTier!.tier].label}
              </span>
              <p className="font-quicksand font-black text-xl text-text-dark mt-2">{selectedTier?.name}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-quicksand font-black text-3xl text-primary-dark tabular-nums">${selectedTier?.price[billing]}</p>
              <p className="text-[10px] font-mono text-muted-dark">/{billing === 'MONTHLY' ? 'mo' : 'yr'}</p>
            </div>
          </div>

          {billing === 'YEARLY' && (
            <div className="pt-4 border-t border-border-dark flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-dark">You save</span>
              <span className={`font-quicksand font-black text-lg ${T[selectedTier!.tier].darkPriceActive}`}>
                ${selectedTier!.price.MONTHLY * 12 - selectedTier!.price.YEARLY}
              </span>
            </div>
          )}
        </div>

        {/* Trust */}
        <div className="space-y-2">
          {['Cancel anytime', 'Secure payment', '100% goes to rescue'].map((item) => (
            <span key={item} className="flex items-center gap-2 text-[11px] text-muted-dark font-mono">
              <span className="w-1 h-1 bg-primary-dark shrink-0" aria-hidden="true" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
