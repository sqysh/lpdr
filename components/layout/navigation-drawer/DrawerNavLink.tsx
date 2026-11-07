import { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { LinkBody } from 'components/_common/LinkBody'

type Props = {
  href: string
  icon: LucideIcon
  label: string
  active: boolean
  onLinkClick: (href: string) => void
  showActiveBorder?: boolean
}

export function DrawerNavLink({ href, icon: Icon, label, active, onLinkClick, showActiveBorder }: Props) {
  return (
    <Link
      href={href}
      onClick={() => onLinkClick(href)}
      className={`flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-tag transition-colors ${
        active
          ? `text-primary-light dark:text-primary-dark bg-surface-light dark:bg-surface-dark ${showActiveBorder ? 'border-l-2 border-primary-light dark:border-primary-dark' : ''}`
          : 'text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark hover:bg-surface-light dark:hover:bg-surface-dark'
      }`}
    >
      <LinkBody icon={<Icon className="w-4 h-4 shrink-0" aria-hidden="true" />} label={label} />
    </Link>
  )
}
