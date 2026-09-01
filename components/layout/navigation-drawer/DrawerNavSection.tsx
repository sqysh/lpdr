'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'

export function DrawerNavSection({
  links,
  isLinkActive,
  onClose
}: {
  links: any[]
  isLinkActive: (link: string) => boolean
  onClose: () => void
}) {
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    )
  }

  return (
    <nav className="px-4 py-4 space-y-0.5" aria-label="Mobile navigation">
      {links.map((navLink, idx) => (
        <div key={idx}>
          {navLink.linkKey ? (
            <Link
              href={navLink.linkKey}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                isLinkActive(navLink.linkKey)
                  ? 'text-primary-light dark:text-primary-dark bg-surface-light dark:bg-surface-dark border-l-2 border-primary-light dark:border-primary-dark'
                  : 'text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark hover:bg-surface-light dark:hover:bg-surface-dark'
              }`}
            >
              <navLink.icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="text-xs uppercase tracking-[0.15em]">{navLink.title}</span>
            </Link>
          ) : (
            <button
              onClick={() => toggleSection(navLink.title)}
              className="w-full flex items-center gap-3 px-4 py-3 text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark hover:bg-surface-light dark:hover:bg-surface-dark transition-colors focus-visible:outline-none"
            >
              <navLink.icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="text-xs uppercase tracking-[0.15em] flex-1 text-left">
                {navLink.title}
              </span>
              <motion.div
                animate={{ rotate: expandedSections.includes(navLink.title) ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              </motion.div>
            </button>
          )}

          <AnimatePresence>
            {navLink.links && expandedSections.includes(navLink.title) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="pl-10 space-y-0.5"
              >
                {navLink.links.map((subLink: any, subIdx: number) => (
                  <motion.div
                    key={subIdx}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: subIdx * 0.04 }}
                  >
                    <Link
                      href={subLink.linkKey}
                      onClick={onClose}
                      className={`block px-4 py-2 font-lato text-xs transition-colors ${
                        isLinkActive(subLink.linkKey)
                          ? 'text-primary-light dark:text-primary-dark font-semibold'
                          : 'text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark hover:bg-surface-light dark:hover:bg-surface-dark'
                      }`}
                    >
                      {subLink.linkText}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </nav>
  )
}
