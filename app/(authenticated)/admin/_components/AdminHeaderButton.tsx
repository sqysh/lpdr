'use client'

import { ReactNode } from 'react'
import Link from 'next/link'

const baseClass =
  'inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-light dark:bg-primary-dark text-white dark:text-bg-dark text-[9px] font-mono tracking-[0.2em] uppercase transition-colors duration-150 hover:bg-secondary-light dark:hover:bg-secondary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark shrink-0'

type BaseProps = {
  children: ReactNode
  /** Optional leading icon (already sized, e.g. <Plus className="w-3 h-3" />). */
  icon?: ReactNode
  ariaLabel?: string
}

type ButtonProps = BaseProps & {
  href?: undefined
  onClick?: () => void
  type?: 'button' | 'submit'
}

type LinkProps = BaseProps & {
  /** When set, renders as a Next.js Link instead of a button. */
  href: string
  onClick?: never
  type?: never
}

type Props = ButtonProps | LinkProps

export default function AdminHeaderButton(props: Props) {
  const { children, icon, ariaLabel } = props

  if (props.href) {
    return (
      <Link href={props.href} aria-label={ariaLabel} className={baseClass}>
        {icon}
        {children}
      </Link>
    )
  }

  return (
    <button type={props.type ?? 'button'} onClick={props.onClick} aria-label={ariaLabel} className={baseClass}>
      {icon}
      {children}
    </button>
  )
}
