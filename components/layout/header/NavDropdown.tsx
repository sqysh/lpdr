'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { Section } from 'lib/constants/navigation.constants'

export const getHeaderLinksVisibilityClass = (priority: number) => {
  switch (priority) {
    case 1:
      return 'hidden lg:block' // always visible in nav range
    case 2:
      return 'hidden lg-2:block' // visible from 1100px
    case 3:
      return 'hidden lg-3:block' // visible from 1160px
    case 4:
      return 'hidden xl:block' // visible from 1280px
    case 5:
      return 'hidden 1336:block' // visible from 1336px
    case 6:
      return 'hidden xl-2:block' // visible from 1380px
    case 7:
      return 'hidden 2xl:block' // visible from 1536px — first to disappear
    default:
      return 'hidden lg:block'
  }
}

export const NavDropdown = ({ section }: { section: Section }) => {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLLIElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isActive =
    section?.linkKey === pathname || section?.links?.some((l) => l.linkKey === pathname) || false

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpen(true)
  }

  const closeMenu = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 200)
  }

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const labelClass = `
    group flex items-center gap-1
    text-[10px] font-mono tracking-[0.2em] uppercase
    whitespace-nowrap
    text-on-dark hover:text-primary-light dark:hover:text-primary-dark
    transition-colors duration-200
    focus:outline-none focus-visible:ring-2
    focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark
  `

  const underline = (active: boolean) => `
    absolute bottom-0 left-0 h-px
    bg-primary-light dark:bg-primary-dark
    transition-all duration-300 ease-out
    ${active ? 'w-full' : 'w-0 group-hover:w-full'}
  `

  return (
    <li
      ref={ref}
      className={`${getHeaderLinksVisibilityClass(section.priority)} relative`}
      onMouseEnter={openMenu}
      onMouseLeave={closeMenu}
    >
      {/* Direct link */}
      {section.linkKey && !section.links ? (
        <Link
          href={section.linkKey}
          aria-current={section.linkKey === pathname ? 'page' : undefined}
          className={labelClass}
        >
          <span
            className={`relative py-7 ${isActive ? 'text-primary-light dark:text-primary-dark' : ''}`}
          >
            {section.title}
            <span aria-hidden="true" className={underline(section.linkKey === pathname)} />
          </span>
        </Link>
      ) : (
        /* Dropdown trigger */
        <button type="button" aria-expanded={open} aria-haspopup="menu" className={labelClass}>
          <span
            className={`relative py-7 ${isActive || open ? 'text-primary-light dark:text-primary-dark' : ''}`}
          >
            {section.title}
            <span aria-hidden="true" className={underline(isActive || open)} />
          </span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="inline-flex text-on-dark"
            aria-hidden="true"
          >
            <ChevronDown className="w-3 h-3" />
          </motion.span>
        </button>
      )}

      <AnimatePresence>
        {open && section.links && (
          <motion.ul
            role="menu"
            aria-label={`${section.title} navigation`}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="
              absolute top-full left-1/2 -translate-x-1/2
              min-w-48 z-50 list-none
              bg-topbar-light dark:bg-topbar-dark
              border border-border-dark
              border-t-2 border-t-primary-light dark:border-t-primary-dark
              px-8 py-6 space-y-4
            "
          >
            {section.links.map((link) => (
              <li key={link.linkKey} role="none">
                <Link
                  href={link.linkKey}
                  role="menuitem"
                  aria-current={link.linkKey === pathname ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                  className={`
                    group flex items-center
                    text-[10px] font-mono tracking-[0.15em] uppercase
                    transition-colors duration-200
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-inset
                    focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark
                    ${
                      link.linkKey === pathname
                        ? 'text-primary-light dark:text-primary-dark'
                        : 'text-on-dark hover:text-primary-light dark:hover:text-primary-dark'
                    }
                  `}
                >
                  <span className="relative whitespace-nowrap">
                    {link.linkText}
                    <span aria-hidden="true" className={underline(link.linkKey === pathname)} />
                  </span>
                </Link>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  )
}
