import { SectionLabel } from 'app/components/_primitives'
import { Eye, Gavel, ShoppingCart } from 'lucide-react'

export function AuctionHowItWorks({ isActive }: { isActive: boolean }) {
  if (!isActive) return null

  return (
    <section aria-labelledby="how-heading" className="border border-border-light dark:border-border-dark">
      <div className="px-5 py-4 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
        <SectionLabel>How It Works</SectionLabel>
      </div>
      <div className="grid grid-cols-1 xs:grid-cols-3 gap-px bg-border-light dark:bg-border-dark">
        {[
          {
            icon: Eye,
            step: '01',
            title: 'Browse Items',
            description: 'Explore all available items and find something you love.'
          },
          {
            icon: Gavel,
            step: '02',
            title: 'Place Your Bid',
            description: 'Click Place Bid on any auction item to submit your bid amount.'
          },
          {
            icon: ShoppingCart,
            step: '03',
            title: 'Win & Checkout',
            description: "If you win, you'll receive an email with payment and shipping details."
          }
        ].map(({ icon: Icon, step, title, description }) => (
          <div key={step} className="bg-bg-light dark:bg-bg-dark px-5 py-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[9px] font-mono font-black text-primary-light dark:text-primary-dark tracking-widest">
                {step}
              </span>
              <Icon size={13} className="text-primary-light dark:text-primary-dark" aria-hidden="true" />
            </div>
            <h3 className="font-quicksand font-black text-sm text-text-light dark:text-text-dark mb-1.5">{title}</h3>
            <p className="text-[11px] font-nunito text-muted-light dark:text-muted-dark leading-relaxed">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
