'use client'

import { mainNavigationLinks } from 'lib/constants/navigation.constants'
import { setCloseMobileNavigation, setOpenMobileNavigation } from 'lib/store/slices/uiSlice'
import { store, useCartSelector, useUiSelector } from 'lib/store/store'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { DrawerHeader } from './DrawerHeader'
import { DrawerAuctionBanner } from './DrawerAuctionBanner'
import { DrawerAuthSection } from './DrawerAuthSection'
import { DrawerCartLink } from './DrawerCartLink'
import { DrawerNewsletterForm } from './DrawerNewsletterForm'
import { DrawerNavSection } from './DrawerNavSection'

export default function NavigationDrawer({ auction, hasActiveFee }) {
  const { mobileNavigation } = useUiSelector()
  const pathname = usePathname()
  const session = useSession()
  const { items } = useCartSelector()
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const searchParams = useSearchParams()

  const onClose = () => store.dispatch(setCloseMobileNavigation())
  const isLinkActive = (link: string) => pathname === link

  useEffect(() => {
    if (searchParams.get('auth') === 'success') {
      store.dispatch(setOpenMobileNavigation())
    }
  }, [searchParams])

  return (
    <AnimatePresence>
      {mobileNavigation && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-120"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed left-0 top-0 h-screen w-full sm:w-96 bg-bg-light dark:bg-bg-dark border-r border-border-light dark:border-border-dark z-130 overflow-y-auto"
            initial={{ x: -500 }}
            animate={{ x: 0 }}
            exit={{ x: -500 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <DrawerHeader onClose={onClose} />

            <div className="flex-1 overflow-y-auto pb-20">
              <DrawerAuctionBanner auction={auction} onClose={onClose} />

              <DrawerAuthSection session={session} isLinkActive={isLinkActive} onClose={onClose} />

              <div className="mx-4 border-t border-border-light/50 dark:border-border-dark" />

              <DrawerCartLink
                totalItems={totalItems}
                active={isLinkActive('/cart')}
                onClose={onClose}
              />

              <div className="mx-4 border-t border-border-light/50 dark:border-border-dark" />

              <DrawerNewsletterForm onClose={onClose} />

              <div className="mx-4 border-t border-border-light dark:border-border-dark" />

              <DrawerNavSection
                links={mainNavigationLinks(hasActiveFee)}
                isLinkActive={isLinkActive}
                onClose={onClose}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
