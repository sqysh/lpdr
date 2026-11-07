import { ShoppingBasket } from 'lucide-react'
import Link from 'next/link'
import { LinkBody } from 'components/_common/LinkBody'

export function DrawerCartLink({
  totalItems,
  active,
  onLinkClick
}: {
  totalItems: number
  active: boolean
  onLinkClick: (href: string) => void
}) {
  return (
    <Link
      href="/cart"
      onClick={() => onLinkClick('/cart')}
      aria-label={`View shopping cart${totalItems > 0 ? `, ${totalItems} item${totalItems !== 1 ? 's' : ''}` : ''}`}
      className={`flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-tag transition-colors ${
        active
          ? 'text-primary-light dark:text-primary-dark bg-surface-light dark:bg-surface-dark'
          : 'text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark hover:bg-surface-light dark:hover:bg-surface-dark'
      }`}
    >
      <LinkBody
        icon={
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
        }
        label="Cart"
      />
    </Link>
  )
}
