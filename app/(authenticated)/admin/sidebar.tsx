'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Loader2, LogOut, ShieldCheck } from 'lucide-react'
import { ADMIN_NAV_GROUPS } from 'lib/constants/navigation.constants'
import { Role } from '@prisma/client'
import { formatRole } from 'lib/utils/user.utils'
import { BypassCode } from './_components/BypassCode'
import { NavRowBody } from 'app/(authenticated)/admin/_components/NavRowBody'
import { useState } from 'react'
import { LinkBody } from 'components/_common/LinkBody'

export default function AdminSidebar({
  onClose,
  email,
  role,
  bypassCode,
  bypassCodeRotatesAt
}: {
  onClose?: () => void
  email: string
  role: Role
  bypassCode: string
  bypassCodeRotatesAt: string
}) {
  const pathname = usePathname()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = () => {
    setSigningOut(true)
    signOut({ redirectTo: '/' })
  }

  const isActive = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(`${href}/`))

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
        className="flex items-center gap-2.5 px-4 mb-6 font-mono text-[11px] tracking-eyebrow uppercase text-text-light dark:text-text-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
      >
        <LinkBody icon={null} label="Little Paws" />
        <span className="sr-only">, back to the site</span>
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
                  onClick={onClose}
                  aria-current={active ? 'page' : undefined}
                  className={rowClass(active)}
                >
                  {active && (
                    <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary-light dark:bg-primary-dark" aria-hidden="true" />
                  )}
                  <NavRowBody Icon={Icon} label={item.label} />
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
            onClick={onClose}
            aria-current={isActive('/super') ? 'page' : undefined}
            className={rowClass(isActive('/super'))}
          >
            {isActive('/super') && (
              <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary-light dark:bg-primary-dark" aria-hidden="true" />
            )}
            <NavRowBody Icon={ShieldCheck} label="Super" />
          </Link>
        </div>
      )}

      {/* Identity + Logout — pinned to bottom */}
      <div className="shrink-0">
        <BypassCode code={bypassCode} rotatesAt={bypassCodeRotatesAt} role={role} />

        <div className="pt-4 border-t border-border-light dark:border-border-dark shrink-0">
          {email && (
            <div className="px-4 pb-3">
              <p className="font-mono text-[10px] text-text-light dark:text-text-dark truncate">{email}</p>
              <p className="font-mono text-[9px] tracking-tag uppercase text-muted-light dark:text-muted-dark mt-0.5">{formatRole(role)}</p>
            </div>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full flex items-center gap-3 px-4 py-2 text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark hover:bg-bg-light dark:hover:bg-bg-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {signingOut ? (
              <Loader2 className="w-4.5 h-4.5 shrink-0 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="w-4.5 h-4.5 shrink-0" aria-hidden="true" />
            )}
            <span className="font-mono text-[11px] tracking-widest uppercase">{signingOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
