'use client'

import Link from 'next/link'
import { LogIn, Menu, ShoppingBasket, User } from 'lucide-react'
import GoogleTranslate from './GoogleTranslate'
import { NavDropdown } from './NavDropdown'
import { mainNavigationLinks } from 'lib/constants/navigation.constants'
import AuctionAnnouncementStrip from './AuctionAnnouncementStrip'
import { useScrollDirection } from 'lib/hooks/useScrollDirection.hook'
import Picture from 'components/_common/Picture'
import { useNavigationStore } from 'stores/navigation.store'
import { useCartStore } from 'stores/cart.store'
import { useModalsStore } from 'stores/modals.store'
import { AuctionStatus } from '@prisma/client'

type HeaderClientProps = {
  auction: {
    id: string
    title: string
    status: AuctionStatus
    startDate?: Date | null
    endDate?: Date | null
    customAuctionLink: string
    isPubliclyVisible: boolean
  }
  hasActiveFee: boolean
  isAuthed: boolean
}

const focusRing = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark'

const topBarLink =
  'text-on-dark text-[10px] font-mono tracking-[0.15em] uppercase hover:text-primary-light dark:hover:text-primary-dark transition-colors'

const infoText = 'text-on-dark text-[10px] font-mono tracking-[0.15em] uppercase'

const burger = `text-on-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors ${focusRing} rounded p-1`

const cartLink = `relative inline-flex items-center ${focusRing} rounded p-1`

const cartBadge =
  'absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-primary-light dark:bg-primary-dark text-white text-[9px] font-mono font-bold'

const donateButton =
  'inline-flex items-center justify-center bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark text-white font-mono uppercase transition-colors duration-200 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-white'

export function HeaderClient({ auction, hasActiveFee, isAuthed }: HeaderClientProps) {
  const { hidden } = useScrollDirection()
  const mobileNavOpen = useNavigationStore((s) => s.mobileNavOpen)
  const openMobileNav = useNavigationStore((s) => s.openMobileNav)
  const openContact = useModalsStore((s) => s.openContact)
  const items = useCartStore((s) => s.items)

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const cartLabel = `View shopping cart${totalItems > 0 ? ` — ${totalItems} item${totalItems !== 1 ? 's' : ''}` : ''}`

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-9999 focus:px-4 focus:py-2 focus:bg-primary-light dark:focus:bg-primary-dark focus:text-white focus:font-semibold focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Whole header — slides up on scroll-down via CSS transform */}
      <div
        className={`sticky top-0 z-50 w-full transition-transform duration-300 ease-out ${
          hidden ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        {/* ── Top Bar (desktop/tablet only) ── */}
        <header
          role="banner"
          className="hidden sm:block pr-3.25 1336:pr-0 w-full mx-auto bg-topbar-light dark:bg-topbar-dark relative z-100 h-11"
        >
          <div className="max-w-334 mx-auto flex items-center justify-between h-11">
            <div className="flex items-center space-x-4 lg:space-x-10">
              <GoogleTranslate />
              <address
                className="hidden sm:flex items-center space-x-4 lg:space-x-6 not-italic"
                aria-label="Contact and organizational information"
              >
                <button
                  type="button"
                  onClick={openContact}
                  aria-label="Email us at lpdr@littlepawsdr.org"
                  className={`${topBarLink} hover:underline ${focusRing} rounded`}
                >
                  lpdr@littlepawsdr.org
                </button>
                <span className={`hidden md:inline ${infoText}`}>P.O. Box 108 · Brookfield, CT 06804</span>
                <span className={`hidden lg:inline ${infoText}`}>EIN 46-3079501</span>
              </address>
            </div>

            <nav aria-label="Utility navigation">
              <ul className="flex items-center space-x-6 list-none">
                <li>
                  <Link href="/cart" aria-label={cartLabel} className={cartLink}>
                    <ShoppingBasket
                      className="w-4 h-4 text-on-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors"
                      aria-hidden="true"
                    />
                    {totalItems > 0 && (
                      <span className={cartBadge} aria-hidden="true">
                        {totalItems > 9 ? '9+' : totalItems}
                      </span>
                    )}
                  </Link>
                </li>
                <li>
                  <Link
                    href={isAuthed ? '/my-pack' : '/auth/login'}
                    aria-label={isAuthed ? 'Go to My Pack' : 'Sign in to your account'}
                    className={`inline-flex items-center gap-1.5 ${topBarLink} tracking-[0.2em] whitespace-nowrap ${focusRing} rounded`}
                  >
                    {isAuthed ? (
                      <>
                        <User className="w-3 h-3" aria-hidden="true" />
                        My Pack
                      </>
                    ) : (
                      <>
                        <LogIn className="w-3 h-3" aria-hidden="true" />
                        Sign In
                      </>
                    )}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        {/* ── Mobile nav: burger / logo / cart + donate ── */}
        <nav aria-label="Main navigation" className="sm:hidden bg-navbar-light dark:bg-navbar-dark relative z-40 h-16 px-4">
          <div className="grid grid-cols-3 items-center h-full">
            <div className="flex justify-start">
              <button
                type="button"
                onClick={openMobileNav}
                className={burger}
                aria-label="Open navigation menu"
                aria-expanded={mobileNavOpen}
                aria-controls="mobile-navigation"
              >
                <Menu className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>

            <div className="flex justify-center">
              <Link href="/" aria-label="Little Paws Dachshund Rescue - Home" className={focusRing}>
                <Picture
                  src="/images/logos/logo.png"
                  alt="Little Paws Dachshund Rescue"
                  className="block w-auto h-11 hover:opacity-80 transition-opacity"
                  priority
                />
              </Link>
            </div>

            <div className="flex justify-end items-center gap-3">
              <Link href="/cart" aria-label={cartLabel} className={cartLink}>
                <ShoppingBasket
                  className="w-5 h-5 text-on-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors"
                  aria-hidden="true"
                />
                {totalItems > 0 && (
                  <span className={cartBadge} aria-hidden="true">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              <Link
                href="/donate"
                aria-label="Donate to Little Paws Dachshund Rescue today"
                className={`${donateButton} px-3 py-2 text-[9px] tracking-[0.15em]`}
              >
                Donate
              </Link>
            </div>
          </div>
        </nav>

        {/* ── Desktop nav (sm and up) ── */}
        <nav
          aria-label="Main navigation"
          className="hidden sm:flex px-3.25 w-full mx-auto bg-navbar-light dark:bg-navbar-dark z-50 flex-col justify-center transition-[height] duration-300 ease-out h-22.5"
        >
          <div className="max-w-334 mx-auto w-full flex items-center justify-between relative">
            <div className="flex items-center gap-x-10">
              <Link href="/" aria-label="Little Paws Dachshund Rescue - Home" className={focusRing}>
                <div className="flex items-center space-x-3 origin-left transition-transform duration-300 ease-out">
                  <div className="overflow-hidden flex items-center justify-center transition-[height] duration-300 ease-out h-16">
                    <Picture
                      src="/images/logos/logo.png"
                      alt="Little Paws Dachshund Rescue"
                      className="block w-auto h-full cursor-pointer hover:opacity-80 transition-opacity"
                      priority
                    />
                  </div>
                </div>
              </Link>
              <button
                type="button"
                onClick={openMobileNav}
                className={`block xl:hidden ${burger}`}
                aria-label="Open navigation menu"
                aria-expanded={mobileNavOpen}
                aria-controls="mobile-navigation"
              >
                <Menu className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Section navigation">
              <ul className="flex items-center space-x-6 list-none">
                {mainNavigationLinks(hasActiveFee).map((section) => (
                  <NavDropdown key={section.title} section={section} />
                ))}
              </ul>
            </nav>

            <div className="origin-right transition-transform duration-300 ease-out hover:scale-105 active:scale-95">
              <Link
                href="/donate"
                aria-label="Donate to Little Paws Dachshund Rescue today"
                className={`${donateButton} gap-2 px-6 py-3 text-[10px] tracking-[0.2em] focus-visible:ring-offset-2 focus-visible:ring-offset-primary-light dark:focus-visible:ring-offset-primary-dark`}
              >
                Donate
              </Link>
            </div>
          </div>
        </nav>

        {/* Auction strip */}
        <div className="w-full mx-auto bg-topbar-light dark:bg-topbar-dark relative z-40">
          <div className="mx-auto flex items-center justify-between">
            <AuctionAnnouncementStrip auction={auction} />
          </div>
        </div>
      </div>
    </>
  )
}
