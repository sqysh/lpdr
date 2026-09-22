'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { TABS } from 'lib/constants/my-pack.constants'
import { useRouter } from 'next/navigation'
import { MyPackTab } from 'types/my-pack.types'

export function MyPackNav({ active }: { active: MyPackTab }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  // The tab lives in the URL, so every switch is a server round trip. Tracking which one was
  // clicked lets that tab show it's loading instead of the page looking unresponsive
  const [pendingTab, setPendingTab] = useState<MyPackTab | null>(null)

  const navigate = (tab: MyPackTab) => {
    if (tab === active) return
    setPendingTab(tab)
    startTransition(() => router.push(`/my-pack?tab=${tab}`, { scroll: false }))
  }

  const isLoading = (id: MyPackTab) => isPending && pendingTab === id

  return (
    <>
      {/* ── Desktop tab bar ── */}
      <motion.nav
        aria-label="My Pack sections"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="hidden sm:flex items-center border-b border-border-light dark:border-border-dark"
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => navigate(id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex items-center gap-2 px-5 py-3 text-f10 font-mono tracking-eyebrow uppercase transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark ${
                isActive
                  ? 'text-primary-light dark:text-primary-dark'
                  : 'text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark'
              }`}
            >
              {isLoading(id) ? (
                <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" aria-hidden="true" />
              ) : (
                <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              )}
              {label}
              {isActive && (
                <motion.span
                  layoutId="desktop-nav-underline"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="absolute bottom-0 left-0 right-0 h-px bg-primary-light dark:bg-primary-dark"
                />
              )}
            </button>
          )
        })}
      </motion.nav>

      {/* ── Mobile floating bar ── */}
      <motion.nav
        aria-label="My Pack sections"
        initial={{ opacity: 0, y: 20, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
        // Sits above the iPhone home indicator rather than on top of it
        className="sm:hidden fixed left-1/2 z-50 bottom-[calc(env(safe-area-inset-bottom,0px)+1rem)]"
      >
        <div
          className="flex items-center px-1.5 py-1.5 gap-1 bg-white/12 dark:bg-black/30 border border-white/30 dark:border-white/10 backdrop-blur-2xl backdrop-saturate-[1.8]"
          style={{ boxShadow: '0 1px 1px rgba(255,255,255,0.5) inset, 0 -1px 1px rgba(0,0,0,0.05) inset, 0 8px 24px rgba(0,0,0,0.12)' }}
        >
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                onClick={() => navigate(id)}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                className="relative flex items-center justify-center w-11 h-11 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                {isActive && (
                  <motion.span
                    layoutId="mobile-nav-pill"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    className="absolute inset-0 bg-white/25 dark:bg-white/10"
                    style={{ boxShadow: '0 1px 1px rgba(255,255,255,0.6) inset, 0 2px 6px rgba(0,0,0,0.08)' }}
                  />
                )}
                {isLoading(id) ? (
                  <Loader2
                    className="relative w-5 h-5 shrink-0 animate-spin text-primary-light dark:text-primary-dark"
                    aria-hidden="true"
                  />
                ) : (
                  <Icon
                    className={`relative w-5 h-5 shrink-0 transition-colors ${
                      isActive ? 'text-primary-light dark:text-primary-dark' : 'text-black/40 dark:text-white/50'
                    }`}
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          })}
        </div>
      </motion.nav>
    </>
  )
}
