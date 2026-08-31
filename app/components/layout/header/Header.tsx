import Link from 'next/link'
import { LogIn, Menu, ShoppingBasket, User } from 'lucide-react'
import { store, useCartSelector, useUiSelector } from 'lib/store/store'
import GoogleTranslate from './GoogleTranslate'
import { setOpenContactModal, setOpenMobileNavigation } from 'lib/store/slices/uiSlice'
import { NavDropdown } from './NavDropdown'
import { mainNavigationLinks } from 'lib/constants/navigation.constants'
import AuctionAnnouncementStrip from './AuctionAnnouncementStrip'
import { useScrollDirection } from 'lib/hooks/useScrollDirection.hook'
import Picture from 'app/components/_common/Picture'

export default function Header({ auction, hasActiveFee, isAuthed }) {
  const { hidden } = useScrollDirection()
  const { mobileNavigation } = useUiSelector()
  const { items } = useCartSelector()
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

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
          className="hidden sm:block pr-3.25 1336:pr-0 w-full mx-auto bg-topbar-light dark:bg-topbar-dark relative z-100 h-11 "
        >
          <div className="max-w-334 mx-auto flex items-center justify-between h-11">
            <div className="flex items-center space-x-4 lg:space-x-10">
              <GoogleTranslate />
              <address
                className="hidden sm:flex items-center space-x-4 lg:space-x-6 not-italic"
                aria-label="Contact and organizational information"
              >
                <button
                  onClick={() => store.dispatch(setOpenContactModal())}
                  aria-label="Email us at lpdr@littlepawsdr.org"
                  className="text-on-dark text-[10px] font-mono tracking-[0.15em] uppercase hover:text-primary-light dark:hover:text-primary-dark transition-colors hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark rounded"
                >
                  lpdr@littlepawsdr.org
                </button>
                <span className="hidden md:inline text-on-dark text-[10px] font-mono tracking-[0.15em] uppercase">
                  P.O. Box 108 · Brookfield, CT 06804
                </span>
                <span className="hidden lg:inline text-on-dark text-[10px] font-mono tracking-[0.15em] uppercase">
                  EIN 46-3079501
                </span>
              </address>
            </div>

            <nav aria-label="Utility navigation">
              <ul className="flex items-center space-x-6 list-none">
                <li>
                  <Link
                    href="/cart"
                    aria-label={`View shopping cart${totalItems > 0 ? ` — ${totalItems} item${totalItems !== 1 ? 's' : ''}` : ''}`}
                    className="relative inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark rounded p-1"
                  >
                    <ShoppingBasket
                      className="w-4 h-4 text-on-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors"
                      aria-hidden="true"
                    />
                    {totalItems > 0 && (
                      <span
                        className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-primary-light dark:bg-primary-dark text-white text-[9px] font-mono font-bold "
                        aria-hidden="true"
                      >
                        {totalItems > 9 ? '9+' : totalItems}
                      </span>
                    )}
                  </Link>
                </li>
                <li>
                  <Link
                    href={isAuthed ? '/my-pack' : '/auth/login'}
                    aria-label={isAuthed ? 'Go to My Pack' : 'Sign in to your account'}
                    className="inline-flex items-center gap-1.5 text-on-dark hover:text-primary-light dark:hover:text-primary-dark text-[10px] font-mono tracking-[0.2em] uppercase transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark rounded"
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
        <nav
          aria-label="Main navigation"
          className="sm:hidden bg-navbar-light dark:bg-navbar-dark relative z-40 h-16 px-4"
        >
          <div className="grid grid-cols-3 items-center h-full">
            <div className="flex justify-start">
              <button
                onClick={() => store.dispatch(setOpenMobileNavigation())}
                className="text-on-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark rounded p-1"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileNavigation}
                aria-controls="mobile-navigation"
              >
                <Menu className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>

            <div className="flex justify-center">
              <Link
                href="/"
                aria-label="Little Paws Dachshund Rescue - Home"
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                <Picture
                  src="/images/logos/logo.png"
                  alt="Little Paws Dachshund Rescue"
                  className="block w-auto h-11 hover:opacity-80 transition-opacity"
                  priority
                />
              </Link>
            </div>

            <div className="flex justify-end items-center gap-3">
              <Link
                href="/cart"
                aria-label={`View shopping cart${totalItems > 0 ? ` — ${totalItems} item${totalItems !== 1 ? 's' : ''}` : ''}`}
                className="relative inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark rounded p-1"
              >
                <ShoppingBasket
                  className="w-5 h-5 text-on-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors"
                  aria-hidden="true"
                />
                {totalItems > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-primary-light dark:bg-primary-dark text-white text-[9px] font-mono font-bold"
                    aria-hidden="true"
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>

              <Link
                href="/donate"
                aria-label="Donate to Little Paws Dachshund Rescue today"
                className="inline-flex items-center justify-center px-3 py-2 bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark text-white text-[9px] font-mono tracking-[0.15em] uppercase transition-colors duration-200 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Donate
              </Link>
            </div>
          </div>
        </nav>

        {/* ── Desktop nav (sm and up) — height shrinks on scroll via CSS ── */}
        <nav
          aria-label="Main navigation"
          className={`hidden sm:flex px-3.25 w-full mx-auto bg-navbar-light dark:bg-navbar-dark z-50 flex-col justify-center transition-[height] duration-300 ease-out h-22.5`}
        >
          <div className="max-w-334 mx-auto w-full flex items-center justify-between relative">
            <div className="flex items-center gap-x-10">
              <Link
                href="/"
                aria-label="Little Paws Dachshund Rescue - Home"
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
              >
                <div
                  className={`flex items-center space-x-3 origin-left transition-transform duration-300 ease-out`}
                >
                  <div
                    className={`overflow-hidden flex items-center justify-center transition-[height] duration-300 ease-out h-16`}
                  >
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
                onClick={() => store.dispatch(setOpenMobileNavigation())}
                className="block xl:hidden text-on-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark rounded"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileNavigation}
                aria-controls="mobile-navigation"
              >
                <Menu className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Main navigation">
              <ul className="flex items-center space-x-6 list-none">
                {mainNavigationLinks(hasActiveFee).map((section) => (
                  <NavDropdown key={section.title} section={section} />
                ))}
              </ul>
            </nav>

            <div
              className={`origin-right transition-transform duration-300 ease-out hover:scale-105 active:scale-95 scale-100`}
            >
              <Link
                href="/donate"
                aria-label="Donate to Little Paws Dachshund Rescue today"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark text-white text-[10px] font-mono tracking-[0.2em] uppercase transition-colors duration-200 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-light dark:focus-visible:ring-offset-primary-dark"
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
