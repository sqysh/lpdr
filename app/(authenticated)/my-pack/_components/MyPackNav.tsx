'use client'

import { motion } from 'framer-motion'
import { TABS } from 'lib/constants/my-pack.constants'
import { useRouter } from 'next/navigation'
import { MyPackTab } from 'types/my-pack.types'

export function MyPackNav({ active }: { active: MyPackTab }) {
  const router = useRouter()

  const navigate = (tab: MyPackTab) => {
    router.push(`/my-pack?tab=${tab}`, { scroll: false })
  }

  return (
    <>
      {/* ── Desktop horizontal tab bar ── */}
      <motion.div
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
              className={`relative flex items-center gap-2 px-5 py-3 text-[10px] font-mono tracking-[0.2em] uppercase transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark ${
                isActive
                  ? 'text-primary-light dark:text-primary-dark'
                  : 'text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
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
      </motion.div>

      {/* ── Mobile floating bottom bar — liquid glass ── */}
      <motion.div
        initial={{ opacity: 0, y: 20, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="sm:hidden fixed bottom-4 left-1/2 z-50"
        role="navigation"
        aria-label="My Pack navigation"
      >
        <div
          className="flex items-center px-1.5 py-1.5 gap-1 rounded-full"
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            boxShadow: `0 1px 1px rgba(255,255,255,0.5) inset, 0 -1px 1px rgba(0,0,0,0.05) inset, 0 8px 24px rgba(0,0,0,0.12)`,
            border: '1px solid rgba(255,255,255,0.3)'
          }}
        >
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                onClick={() => navigate(id)}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                className="relative flex items-center justify-center w-11 h-11 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light"
              >
                {isActive && (
                  <motion.span
                    layoutId="mobile-nav-pill"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'rgba(255, 255, 255, 0.25)',
                      boxShadow: '0 1px 1px rgba(255,255,255,0.6) inset, 0 2px 6px rgba(0,0,0,0.08)'
                    }}
                  />
                )}
                <Icon
                  className="relative w-5 h-5 shrink-0 transition-colors"
                  style={{
                    color: isActive ? 'var(--color-primary-light)' : 'rgba(0,0,0,0.4)'
                  }}
                  aria-hidden="true"
                />
              </button>
            )
          })}
        </div>
      </motion.div>
    </>
  )
}
