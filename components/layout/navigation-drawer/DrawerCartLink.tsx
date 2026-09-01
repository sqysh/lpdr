import { ShoppingBasket } from 'lucide-react'
import Link from 'next/link'

export function DrawerCartLink({
  totalItems,
  active,
  onClose
}: {
  totalItems: number
  active: boolean
  onClose: () => void
}) {
  return (
    <Link
      href="/cart"
      onClick={onClose}
      aria-label={`View shopping cart${totalItems > 0 ? ` — ${totalItems} item${totalItems !== 1 ? 's' : ''}` : ''}`}
      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
        active
          ? 'text-primary-light dark:text-primary-dark bg-surface-light dark:bg-surface-dark'
          : 'text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark hover:bg-surface-light dark:hover:bg-surface-dark'
      }`}
    >
      <span className="relative inline-flex items-center shrink-0">
        <ShoppingBasket className="w-4 h-4" aria-hidden="true" />
        {totalItems > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center bg-primary-light dark:bg-primary-dark text-white text-[9px] font-mono font-bold"
            aria-hidden="true"
          >
            {totalItems > 9 ? '9+' : totalItems}
          </span>
        )}
      </span>
      <span className="text-xs uppercase tracking-[0.15em]">Cart</span>
    </Link>
  )
}
