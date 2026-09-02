'use client'

import { ReactNode, useState } from 'react'
import { Menu } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useEscapeKey } from 'lib/hooks/useEscapeKey.hook'
import AdminSidebar from './sidebar'
import { Role } from '@prisma/client'

export function AdminLayoutClient({
  children,
  email,
  role,
  bypassCode,
  bypassCodeRotatesAt
}: {
  children: ReactNode
  email: string
  role: Role
  bypassCode: string
  bypassCodeRotatesAt: string
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEscapeKey(mobileNavOpen, () => setMobileNavOpen(false))

  return (
    <div className="min-h-screen flex bg-bg-light dark:bg-bg-dark">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar
          onClose={() => setMobileNavOpen(false)}
          email={email}
          role={role}
          bypassCode={bypassCode}
          bypassCodeRotatesAt={bypassCodeRotatesAt}
        />
      </div>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileNavOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              key="nav"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-100 lg:hidden"
            >
              <AdminSidebar
                onClose={() => setMobileNavOpen(false)}
                email={email}
                role={role}
                bypassCode={bypassCode}
                bypassCodeRotatesAt={bypassCodeRotatesAt}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 h-12 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shrink-0">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation"
            className="p-1 text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            <Menu size={18} aria-hidden="true" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <span className="w-7 h-7 flex items-center justify-center bg-primary-light dark:bg-primary-dark text-bg-light dark:text-bg-dark font-quicksand font-black text-xs">
              LP
            </span>
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-text-light dark:text-text-dark">
              Admin
            </span>
          </Link>
        </div>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
