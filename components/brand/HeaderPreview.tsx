'use client'

import { useState, type MouseEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { LogIn, Menu, ChevronDown, ShoppingBasket } from 'lucide-react'
import { NavDropdown } from 'components/layout/header/NavDropdown'
import { LinkBody } from 'components/_common/LinkBody'
import { LinkSpinner } from 'components/_common/LinkSpinner'
import { mainNavigationLinks, type Section } from 'lib/constants/navigation.constants'
import { INBOX } from 'lib/constants/email.constants'
import { StageLogo } from './LogoStage'

// Preview of the approved headers (110px desktop with the mascot's paws on the bottom edge, 80px mobile), built from the same links,
// dropdowns, fonts, container width and tokens as the live header. The class strings below are copied from
// components/layout/header/HeaderClient.tsx, which stays untouched.
// The links and dropdowns are the live NavDropdown and mainNavigationLinks themselves.
const topBarLink =
  'text-on-dark text-[10px] font-mono tracking-tag uppercase hover:text-primary-light dark:hover:text-primary-dark transition-colors'
const infoText = 'text-on-dark text-[10px] font-mono tracking-tag uppercase'
const burger = 'text-on-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors rounded p-1'
const donateButton =
  'inline-flex items-center justify-center bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark text-white font-mono uppercase transition-colors duration-200 whitespace-nowrap'

const NAV_HEIGHT = 110

const MASCOT_HEIGHT = 100

// The simplified hierarchy is rebuilt from the live mainNavigationLinks, so every destination comes from the real configuration.
// Home is dropped because the logo links to it.
export function simplifiedNavigation(): { sections: Section[]; donate: Section; all: string[]; missing: string[] } {
  const live = mainNavigationLinks(false, true)
  const get = (title: string) => live.find((s) => s.title === title)!
  const link = (title: string, linkText = title) => ({ linkKey: get(title).linkKey!, linkText })

  const sections: Section[] = [
    { ...get('About'), linkKey: undefined, links: [link('About'), link('Newsletters')] },
    get('Dachshunds'),
    get('Adopt'),
    { ...get('Volunteer'), title: 'Get Involved' },
    get('Rainbow Bridge'),
    { ...get('Merch'), title: 'Shop', linkKey: undefined, links: [link('Merch'), link('Auctions')] }
  ]
  const donate = get('Donate')

  const destinations = (list: Section[]) =>
    list.flatMap((s) => [...(s.linkKey ? [s.linkKey] : []), ...(s.links ?? []).map((l) => l.linkKey)])
  const kept = new Set([...destinations([...sections, donate]), '/'])
  return { sections, donate, all: [...kept], missing: destinations(live).filter((k) => !kept.has(k)) }
}

// Previews are for looking, not navigating
const stayPut = (e: MouseEvent) => {
  if ((e.target as HTMLElement).closest('a')) e.preventDefault()
}

function UtilityBar() {
  return (
    <div className="pr-3.25 1336:pr-0 w-full bg-topbar-light dark:bg-topbar-dark h-11">
      <div className="max-w-334 mx-auto flex items-center justify-between h-11">
        <div className="flex items-center space-x-4 lg:space-x-10">
          {/* the live bar's Google Translate control, as a static stand-in so no translate script loads here */}
          <span className={`inline-flex items-center gap-1 ${infoText}`}>
            English <ChevronDown className="w-3 h-3" aria-hidden="true" />
          </span>
          <address className="hidden sm:flex items-center space-x-4 lg:space-x-6 not-italic">
            <span className={topBarLink}>{INBOX.general}</span>
            <span className={`hidden md:inline ${infoText}`}>P.O. Box 108 · Brookfield, CT 06804</span>
            <span className={`hidden lg:inline ${infoText}`}>EIN 46-3079501</span>
          </address>
        </div>
        <ul className="flex items-center space-x-6 list-none">
          <li>
            <Link href="/cart" aria-label="View shopping cart" className="relative inline-flex items-center rounded p-1">
              <ShoppingBasket className="w-4 h-4 text-on-dark" aria-hidden="true" />
            </Link>
          </li>
          <li>
            <Link
              href="/auth/login"
              className={`inline-flex items-center gap-1.5 ${topBarLink} tracking-eyebrow whitespace-nowrap rounded`}
            >
              <LinkBody icon={<LogIn className="w-3 h-3" aria-hidden="true" />} label="Sign in" />
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}

const panel =
  'absolute z-50 list-none bg-topbar-light dark:bg-topbar-dark border border-border-dark border-t-2 border-t-primary-light dark:border-t-primary-dark px-8 py-6 space-y-4'
const panelLink =
  'text-[10px] font-mono tracking-tag uppercase text-on-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors'

// Donate stays the one call to action, with the existing donation options in a menu under it
function DonateMenu({ donate }: { donate: Section }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative shrink-0" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Link
        href="/donate"
        aria-label="Donate to Little Paws Dachshund Rescue today"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`${donateButton} gap-2 px-6 py-3 text-[10px] tracking-eyebrow`}
      >
        <LinkSpinner label="Donate" />
        <ChevronDown className="w-3 h-3" aria-hidden="true" />
      </Link>
      {open && (
        <ul role="menu" aria-label="Donation options" className={`${panel} top-full right-0 min-w-48`}>
          {donate.links?.map((l) => (
            <li key={l.linkKey} role="none">
              <Link href={l.linkKey} role="menuitem" className={`${panelLink} whitespace-nowrap`}>
                {l.linkText}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// The full navigation needs about 1200px of row at the widest logo; below a 1280px header the links collapse into this menu
function HamburgerMenu({ sections, donate }: { sections: Section[]; donate: Section }) {
  const [open, setOpen] = useState(false)
  const groups = [...sections, donate]
  return (
    <div className="relative @min-[1280px]:hidden">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Open navigation menu" className={burger}>
        <Menu className="w-6 h-6" aria-hidden="true" />
      </button>
      {open && (
        <ul className={`${panel} top-full right-0 w-64 space-y-5`}>
          {groups.map((s) => (
            <li key={s.title} className="space-y-2">
              {s.links ? (
                <>
                  <p className="text-[10px] font-mono tracking-eyebrow uppercase text-primary-light dark:text-primary-dark">{s.title}</p>
                  <ul className="space-y-2 list-none">
                    {s.links.map((l) => (
                      <li key={l.linkKey}>
                        <Link href={l.linkKey} className={panelLink}>
                          {l.linkText}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <Link href={s.linkKey!} className={panelLink}>
                  {s.title}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function DesktopHeaderPreview() {
  const nav = simplifiedNavigation()
  return (
    <div onClickCapture={stayPut} className="@container">
      <UtilityBar />
      <div className="px-3.25 w-full bg-navbar-light dark:bg-navbar-dark text-on-dark" style={{ height: NAV_HEIGHT }}>
        <div className={`max-w-334 mx-auto w-full h-full flex items-center gap-x-10 relative`}>
          <Link href="/" aria-label="Little Paws Dachshund Rescue - Home" className="flex items-center self-stretch shrink-0">
            <StageLogo variant="header" background="dark" mascotHeight={MASCOT_HEIGHT} />
          </Link>
          <nav aria-label="Section navigation" className="hidden @min-[1280px]:flex flex-1 justify-end">
            <ul className="flex items-center space-x-8 list-none">
              {nav.sections.map((section) => (
                <NavDropdown key={section.title} section={section} />
              ))}
            </ul>
          </nav>
          <div className="ml-auto @min-[1280px]:ml-0 flex items-center gap-4">
            <DonateMenu donate={nav.donate} />
            <HamburgerMenu sections={nav.sections} donate={nav.donate} />
          </div>
        </div>
      </div>
    </div>
  )
}

// Mobile: burger, logo, cart and Donate. The logo column takes what is left and the logo scales down inside it, so it never overflows.
export function MobileHeaderPreview({ children }: { children: ReactNode }) {
  return (
    <div onClickCapture={stayPut} className={`bg-navbar-light dark:bg-navbar-dark h-20 px-4 flex items-center gap-3 w-93.75 max-w-full`}>
      <button type="button" className={`${burger} shrink-0`} aria-label="Open navigation menu">
        <Menu className="w-6 h-6" aria-hidden="true" />
      </button>
      <div className="flex-1 min-w-0 flex justify-center">{children}</div>
      <div className="flex items-center gap-3 shrink-0">
        <ShoppingBasket className="w-4 h-4 text-on-dark" aria-hidden="true" />
        <Link
          href="/donate"
          aria-label="Donate to Little Paws Dachshund Rescue today"
          className={`${donateButton} px-3 py-2 text-[9px] tracking-tag`}
        >
          Donate
        </Link>
      </div>
    </div>
  )
}
