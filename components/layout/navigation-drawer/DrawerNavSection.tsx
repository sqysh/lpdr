'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { LinkBody } from 'components/_common/LinkBody'
import type { Section } from 'lib/constants/navigation.constants'

export function DrawerNavSection({
  links,
  isLinkActive,
  onLinkClick
}: {
  links: Section[]
  isLinkActive: (link: string) => boolean
  onLinkClick: (href: string) => void
}) {
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => (prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]))
  }

  return (
    <nav className="px-4 py-4 space-y-0.5" aria-label="Mobile navigation">
      {links.map((navLink) => (
        <div key={navLink.title}>
          {navLink.linkKey ? (
            <Link
              href={navLink.linkKey}
              onClick={() => onLinkClick(navLink.linkKey!)}
              className={`flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-tag transition-colors ${
                isLinkActive(navLink.linkKey)
                  ? 'text-primary-light dark:text-primary-dark bg-surface-light dark:bg-surface-dark border-l-2 border-primary-light dark:border-primary-dark'
                  : 'text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark hover:bg-surface-light dark:hover:bg-surface-dark'
              }`}
            >
              <LinkBody icon={<navLink.icon className="w-4 h-4 shrink-0" aria-hidden="true" />} label={navLink.title} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => toggleSection(navLink.title)}
              aria-expanded={expandedSections.includes(navLink.title)}
              className="w-full flex items-center gap-3 px-4 py-3 text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark hover:bg-surface-light dark:hover:bg-surface-dark transition-colors focus-visible:outline-none"
            >
              <navLink.icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="text-xs uppercase tracking-tag flex-1 text-left">{navLink.title}</span>
              <motion.div animate={{ rotate: expandedSections.includes(navLink.title) ? 180 : 0 }} transition={{ duration: 0.2 }}>
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
                {navLink.links.map((subLink, subIdx) => (
                  <motion.div
                    key={subLink.linkKey}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: subIdx * 0.04 }}
                  >
                    <Link
                      href={subLink.linkKey}
                      onClick={() => onLinkClick(subLink.linkKey)}
                      className={`flex items-center gap-2 px-4 py-2 font-lato text-xs transition-colors ${
                        isLinkActive(subLink.linkKey)
                          ? 'text-primary-light dark:text-primary-dark font-semibold'
                          : 'text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark hover:bg-surface-light dark:hover:bg-surface-dark'
                      }`}
                    >
                      <LinkBody icon={null} label={subLink.linkText} iconAfter spinnerClass="w-3 h-3" />
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
