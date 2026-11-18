'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { DesktopHeaderPreview, MobileHeaderPreview, simplifiedNavigation } from 'components/brand/HeaderPreview'
import { PreviewLogo } from './LogoControls'

// The site's theme is the `dark` class on <html>; the toggle flips it for the whole preview page
const isDark = () => document.documentElement.classList.contains('dark')
const subscribeTheme = (notify: () => void) => {
  const observer = new MutationObserver(notify)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}

const caption = 'font-mono text-[11px] text-muted-light dark:text-muted-dark'

export function HeaderCompare() {
  const nav = simplifiedNavigation()
  const dark = useSyncExternalStore(subscribeTheme, isDark, () => false)

  // Put the site's theme back when leaving the preview
  useEffect(() => {
    const root = document.documentElement
    const initial = root.classList.contains('dark')
    return () => {
      root.classList.toggle('dark', initial)
    }
  }, [])

  const toggle = () => document.documentElement.classList.toggle('dark', !dark)

  return (
    <div className="space-y-8">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={dark}
        className="px-3 py-1.5 text-sm border border-border-light dark:border-border-dark aria-pressed:bg-button-light aria-pressed:text-white dark:aria-pressed:bg-button-dark cursor-pointer"
      >
        {dark ? 'Dark theme' : 'Light theme'}
      </button>

      <p className={caption}>
        {nav.missing.length === 0
          ? `All ${nav.all.length} existing destinations are kept (Home through the logo).`
          : `Missing destinations: ${nav.missing.join(', ')}`}
      </p>

      <figure className="space-y-2">
        <DesktopHeaderPreview />
        <figcaption className={caption}>
          Desktop · 110px navigation · 100px mascot with paws on the bottom edge, wordmark centred
        </figcaption>
      </figure>

      <div className="flex flex-wrap gap-6">
        <figure className="space-y-2">
          <MobileHeaderPreview>
            <PreviewLogo variant="horizontal" background="dark" className="w-auto" style={{ height: 64 }} />
          </MobileHeaderPreview>
          <figcaption className={caption}>Mobile · 80px navigation · horizontal logo, 64px (scales down to fit)</figcaption>
        </figure>
      </div>
    </div>
  )
}
