'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, User, Mail } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DrawerNavLink } from './DrawerNavLink'
import { GoogleButton } from 'components/features/auth/GoogleButton'
import { FacebookButton } from 'components/features/auth/FacebookButton'
import { MagicLink } from 'components/features/auth/MagicLink'

type Props = {
  session: any
  isLinkActive: (link: string) => boolean
  onClose: () => void
}

export function DrawerAuthSection({ session, isLinkActive, onClose }: Props) {
  const pathname = usePathname()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const redirectTo = `${pathname}?ref=navdrawer`

  if (session.data?.user) {
    return (
      <div className="px-4 py-4 space-y-1">
        {session.data.user.role === 'ADMIN' && (
          <DrawerNavLink
            href="/admin/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
            active={false}
            onClose={onClose}
          />
        )}
        <DrawerNavLink
          href="/my-pack"
          icon={User}
          label="My Pack"
          active={isLinkActive('/my-pack')}
          onClose={onClose}
        />
      </div>
    )
  }

  return (
    <div className="px-4 py-4">
      <div className="px-4 py-4 space-y-3 border-l-2 border-primary-light dark:border-primary-dark">
        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2 px-3.5 py-2.5 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark"
            >
              <Mail
                className="w-4 h-4 text-primary-light dark:text-primary-dark shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <p className="text-xs uppercase tracking-[0.15em] text-text-light dark:text-text-dark">
                  Check your inbox
                </p>
                <p className="font-lato text-xs text-muted-light dark:text-muted-dark mt-0.5 leading-relaxed">
                  Magic link sent to{' '}
                  <span className="text-text-light dark:text-text-dark">{email}</span>
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-3">
                <p className="text-xs uppercase tracking-[0.25em] text-text-light dark:text-text-dark">
                  Sign In
                </p>
                <p className="font-lato text-xs text-muted-light dark:text-muted-dark mt-1 leading-relaxed">
                  Sign in to view your profile, orders, and more.
                </p>
              </div>

              <div className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-2">
                  <GoogleButton redirectTo={redirectTo} />
                  <FacebookButton redirectTo={redirectTo} />
                </div>

                <div className="flex items-center gap-2.5" aria-hidden="true">
                  <span className="flex-1 h-px bg-border-light dark:bg-border-dark" />
                  <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
                    or
                  </span>
                  <span className="flex-1 h-px bg-border-light dark:bg-border-dark" />
                </div>

                <MagicLink
                  email={email}
                  redirectTo={redirectTo}
                  setEmail={setEmail}
                  setSent={setSent}
                />

                <div className="-mx-4 mt-1 border-t border-border-light dark:border-border-dark px-4 py-3">
                  <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark text-center leading-relaxed">
                    New to Little Paws?{' '}
                    <Link
                      href="/adopt"
                      onClick={onClose}
                      className="text-primary-light dark:text-primary-dark hover:underline underline-offset-2 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary-light"
                    >
                      Start your adoption journey
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
