'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// The presentation covers the admin chrome so it reads as a presentation, not a page of the dashboard. While it does, everything
// behind it is made inert, so keyboard focus and screen readers stay on the presentation.
export function PresentationShell({ children }: { children: ReactNode }) {
  const shell = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const inerted: Element[] = []
    for (let node: Element | null = shell.current; node && node !== document.documentElement; node = node.parentElement) {
      const parent = node.parentElement
      if (!parent) continue
      for (const sibling of parent.children) {
        if (sibling !== node && sibling.tagName !== 'SCRIPT' && !sibling.hasAttribute('inert')) {
          sibling.setAttribute('inert', '')
          inerted.push(sibling)
        }
      }
    }
    return () => inerted.forEach((el) => el.removeAttribute('inert'))
  }, [])

  return (
    <div
      ref={shell}
      id="main-content"
      className="fixed inset-0 z-50 overflow-y-auto bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark scroll-smooth"
    >
      <div className="fixed top-0 inset-x-0 z-10 flex items-center justify-between px-5 sm:px-8 h-12 bg-bg-dark/85 backdrop-blur pointer-events-none">
        <span className="font-mono text-[10px] tracking-eyebrow uppercase text-on-dark">Private · Brand identity</span>
        <Link
          href="/admin/dashboard"
          className="pointer-events-auto inline-flex items-center gap-2 font-mono text-[10px] tracking-eyebrow uppercase text-on-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          <ArrowLeft className="w-3 h-3" aria-hidden="true" />
          Admin
        </Link>
      </div>
      {children}
    </div>
  )
}
