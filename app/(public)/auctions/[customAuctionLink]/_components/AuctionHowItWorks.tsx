import { SectionLabel } from 'components/_primitives'
import { Eye, Gavel, ShoppingCart } from 'lucide-react'

const STEPS = [
  {
    icon: Eye,
    title: 'Browse items',
    description: 'Look through everything up for auction and find something you love.'
  },
  {
    icon: Gavel,
    title: 'Place your bid',
    description: 'Tap Bid on any item, then tap again to confirm. Or open the item to choose your own amount.'
  },
  {
    icon: ShoppingCart,
    title: 'Win and pay',
    description: "If you win, we'll email you to pay, or charge your saved card automatically if you've turned on auto-pay."
  }
]

// Shown before and during the auction, when people are deciding whether and how to bid
export function AuctionHowItWorks({ isEnded }: { isEnded: boolean }) {
  if (isEnded) return null

  return (
    <section aria-labelledby="how-heading" className="mt-14 sm:mt-20 border border-border-light dark:border-border-dark">
      <div className="px-5 py-4 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark space-y-1.5">
        <SectionLabel>How it works</SectionLabel>
        <h2 id="how-heading" className="font-quicksand font-black text-lg text-text-light dark:text-text-dark">
          Bidding in three steps
        </h2>
      </div>
      <ol className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border-light dark:bg-border-dark">
        {STEPS.map(({ icon: Icon, title, description }, i) => (
          <li key={title} className="bg-bg-light dark:bg-bg-dark px-5 py-5">
            {/* The list already gives the order to screen readers, so the number is visual only */}
            <div className="flex items-center gap-3 mb-3" aria-hidden="true">
              <span className="text-[11px] font-mono font-black text-primary-light dark:text-primary-dark tracking-widest">
                {String(i + 1).padStart(2, '0')}
              </span>
              <Icon size={14} className="text-primary-light dark:text-primary-dark" />
            </div>
            <h3 className="font-quicksand font-black text-sm text-text-light dark:text-text-dark mb-1.5">{title}</h3>
            <p className="text-sm font-nunito text-muted-light dark:text-muted-dark leading-relaxed">{description}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
