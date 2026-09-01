'use client'

import { ReactNode, Suspense, useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { Elements } from '@stripe/react-stripe-js'
import { usePathname, useSelectedLayoutSegments } from 'next/navigation'
import { Confetti3D } from './components/_common/Confetti3D'
import { Toast } from './components/_common/Toast'
import Footer from './components/layout/footer/Footer'
import { CartBar } from './components/features/cart/CartBar'
import { CartToast } from './components/features/cart/CartToast'
import { CartPersistence } from './components/features/cart/CartPersistence'
import { AuthRedirectWatcher } from './components/features/login/AuthRedirectWatcher'
import { CookieConsentBanner } from './components/layout/CookieConsentBanner'
import { FixedDonateTab } from './components/layout/FixedDonateTab'
import PublicContactModal from './(public)/(home)/_components/PublicContactModal'
import { HIDDEN_PATHS } from 'lib/constants/navigation.constants'
import { store } from 'lib/store/store'
import { ThemeProvider } from 'lib/providers/theme.provider'
import { stripePromise } from 'lib/stripe/stripe-promise'

interface Props {
  children: ReactNode
  header: ReactNode
  navDrawer: ReactNode
  auctionRealtime: ReactNode
}

export function RootLayoutWrapper({ children, header, navDrawer, auctionRealtime }: Props) {
  const segments = useSelectedLayoutSegments()
  const isNotFound = segments[0] === '__DEFAULT__' || segments.includes('/_not-found')
  const pathname = usePathname()
  const isHidden = HIDDEN_PATHS.some((path) => pathname.startsWith(path)) || isNotFound

  const [burstTrigger, setBurstTrigger] = useState(0)

  useEffect(() => {
    const handler = () => setBurstTrigger((t) => t + 1)
    window.addEventListener('confetti-burst', handler)
    return () => window.removeEventListener('confetti-burst', handler)
  }, [])

  return (
    <Provider store={store}>
      <ThemeProvider>
        <Elements stripe={stripePromise}>
          <Suspense fallback={null}>
            <AuthRedirectWatcher />
          </Suspense>
          <CookieConsentBanner />
          <FixedDonateTab />
          <Toast />
          <Confetti3D burstTrigger={burstTrigger} />
          <CartBar />
          <CartToast />
          <PublicContactModal />
          <Suspense fallback={null}>{navDrawer}</Suspense>
          <Suspense fallback={null}>{auctionRealtime}</Suspense>
          <CartPersistence />
          {!isHidden && header}
          {children}
          {!isHidden && <Footer />}
        </Elements>
      </ThemeProvider>
    </Provider>
  )
}
