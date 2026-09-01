import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { ComponentPropsWithoutRef } from 'react'

type ArrowLinkProps = {
  href: string
  children: React.ReactNode
  variant?: 'outline' | 'solid'
} & Omit<ComponentPropsWithoutRef<typeof Link>, 'href'>

export function ArrowLink({ href, children, variant = 'outline', className = '', ...props }: ArrowLinkProps) {
  const base =
    'group inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold font-nunito tracking-wide ' +
    'transition-all duration-200 ease-out ' +
    'active:scale-[0.97] ' +
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark ' +
    'motion-reduce:transition-none motion-reduce:active:scale-100'

  const variants = {
    outline:
      'border-2 border-primary-light dark:border-primary-dark text-text-light dark:text-text-dark ' +
      '[@media(hover:hover)]:hover:bg-primary-light dark:[@media(hover:hover)]:hover:bg-primary-dark ' +
      '[@media(hover:hover)]:hover:text-white dark:[@media(hover:hover)]:hover:text-bg-dark ' +
      'active:bg-primary-light dark:active:bg-primary-dark active:text-white dark:active:text-bg-dark',
    solid:
      'bg-primary-light dark:bg-primary-dark text-white dark:text-bg-dark ' +
      '[@media(hover:hover)]:hover:bg-secondary-light dark:[@media(hover:hover)]:hover:bg-secondary-dark'
  }

  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
      <ArrowRight
        className="w-4 h-4 transition-transform duration-200 ease-out [@media(hover:hover)]:group-hover:translate-x-1 group-active:translate-x-1"
        aria-hidden="true"
      />
    </Link>
  )
}
