'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LogOut, ShieldCheck } from 'lucide-react'
import { ADMIN_NAV_GROUPS } from 'lib/constants/navigation.constants'
import { Role } from '@prisma/client'
import { formatRole } from 'lib/utils/user.utils'
import { useState } from 'react'

type Props = {
  onClose?: () => void
  email: string
  role: Role
}

export default function AdminSidebar({ onClose, email, role }: Props) {
  const pathname = usePathname()
  const [pending, setPending] = useState<string | null>(null)

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(`${href}/`)

  const rowClass = (active: boolean) =>
    `relative w-full flex items-center gap-3 px-4 py-2 transition-colors ${
      active
        ? 'text-text-light dark:text-text-dark bg-primary-light/10 dark:bg-primary-dark/10'
        : 'text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark hover:bg-bg-light dark:hover:bg-bg-dark'
    }`

  return (
    <nav
      aria-label="Admin sections"
      className="flex w-52 shrink-0 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark flex-col py-4 h-screen sticky top-0"
    >
      {/* Brand */}
      <Link
        href="/"
        aria-label="Little Paws admin home"
        className="flex items-center gap-2.5 px-4 mb-6"
      >
        <span className="w-9 h-9 flex items-center justify-center bg-primary-light dark:bg-primary-dark text-bg-light dark:text-bg-dark font-quicksand font-black text-sm tracking-tight">
          LP
        </span>
        <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-text-light dark:text-text-dark">
          Little Paws
        </span>
      </Link>

      {/* Groups */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-5 min-h-0">
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.heading} className="flex flex-col">
            <p className="px-4 mb-1.5 font-mono text-[9px] tracking-[0.25em] uppercase text-muted-light/70 dark:text-muted-dark/70">
              {group.heading}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => {
                    setPending(item.href)
                    onClose()
                  }}
                  aria-current={active ? 'page' : undefined}
                  className={rowClass(active || pending === item.href)}
                >
                  {active && (
                    <span
                      className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary-light dark:bg-primary-dark"
                      aria-hidden="true"
                    />
                  )}
                  <Icon className="w-4.5 h-4.5 shrink-0" aria-hidden="true" />
                  <span className="font-mono text-[11px] tracking-widest uppercase">
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        ))}
      </div>

      {role === Role.SUPER_USER && (
        <div className="pt-4 mt-4 border-t border-border-light dark:border-border-dark shrink-0">
          <Link
            href="/super"
            onClick={() => {
              setPending('/super')
              onClose?.()
            }}
            aria-current={isActive('/super') ? 'page' : undefined}
            className={rowClass(isActive('/super') || pending === '/super')}
          >
            {isActive('/super') && (
              <span
                className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary-light dark:bg-primary-dark"
                aria-hidden="true"
              />
            )}
            <ShieldCheck className="w-4.5 h-4.5 shrink-0" aria-hidden="true" />
            <span className="font-mono text-[11px] tracking-widest uppercase">Super</span>
          </Link>
        </div>
      )}

      {/* Identity + Logout — pinned to bottom */}
      <div className="pt-4 border-t border-border-light dark:border-border-dark shrink-0">
        {email && (
          <div className="px-4 pb-3">
            <p className="font-mono text-[10px] text-text-light dark:text-text-dark truncate">
              {email}
            </p>
            <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark mt-0.5">
              {formatRole(role)}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={() => signOut({ redirectTo: '/' })}
          className="w-full flex items-center gap-3 px-4 py-2 text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark hover:bg-bg-light dark:hover:bg-bg-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          <LogOut className="w-4.5 h-4.5 shrink-0" aria-hidden="true" />
          <span className="font-mono text-[11px] tracking-widest uppercase">Sign Out</span>
        </button>
      </div>
    </nav>
  )
}
