import { Loader2, ShoppingBasket } from 'lucide-react'
import { useLinkStatus } from 'next/link'

const cartBadge =
  'absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-primary-light dark:bg-primary-dark text-white text-[9px] font-mono font-bold'

export function CartLinkContent({ totalItems }: { totalItems: number }) {
  const { pending } = useLinkStatus()

  return (
    <>
      {pending ? (
        <Loader2 className="w-4 h-4 text-on-dark animate-spin" aria-hidden="true" />
      ) : (
        <ShoppingBasket
          className="w-4 h-4 text-on-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors"
          aria-hidden="true"
        />
      )}
      {totalItems > 0 && (
        <span className={cartBadge} aria-hidden="true">
          {totalItems > 9 ? '9+' : totalItems}
        </span>
      )}
    </>
  )
}
