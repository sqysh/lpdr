import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

type Props = {
  href: string
  icon: LucideIcon
  label: string
  active: boolean
  onClose: () => void
  showActiveBorder?: boolean
}

export function DrawerNavLink({
  href,
  icon: Icon,
  label,
  active,
  onClose,
  showActiveBorder
}: Props) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
        active
          ? `text-primary-light dark:text-primary-dark bg-surface-light dark:bg-surface-dark ${showActiveBorder ? 'border-l-2 border-primary-light dark:border-primary-dark' : ''}`
          : 'text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark hover:bg-surface-light dark:hover:bg-surface-dark'
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span className="text-xs uppercase tracking-[0.15em]">{label}</span>
    </Link>
  )
}
