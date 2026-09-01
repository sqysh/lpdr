'use client'

import { ReactNode, Suspense, useEffect, useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { usePathname, useSelectedLayoutSegments } from 'next/navigation'
import { Confetti3D } from 'components/_common/Confetti3D'
import Footer from 'components/layout/footer/Footer'
import { CartBar } from './(public)/cart/_components/CartBar'
import { CartToast } from './(public)/cart/_components/CartToast'
import { AuthRedirectWatcher } from 'components/layout/AuthRedirectWatcher'
import { CookieConsentBanner } from 'components/layout/CookieConsentBanner'
import { FixedDonateTab } from 'components/layout/FixedDonateTab'
import PublicContactModal from './(public)/(home)/_components/PublicContactModal'
import { HIDDEN_PATHS } from 'lib/constants/navigation.constants'
import { stripePromise } from 'lib/stripe/stripe-promise'
import { useSyncTheme } from 'stores/theme.store'

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

  useSyncTheme()

  useEffect(() => {
    const handler = () => setBurstTrigger((t) => t + 1)
    window.addEventListener('confetti-burst', handler)
    return () => window.removeEventListener('confetti-burst', handler)
  }, [])

  return (
    <Elements stripe={stripePromise}>
      <Suspense fallback={null}>
        <AuthRedirectWatcher />
      </Suspense>
      <CookieConsentBanner />
      <FixedDonateTab />
      <Confetti3D burstTrigger={burstTrigger} />
      <CartBar />
      <CartToast />
      <PublicContactModal />
      <Suspense fallback={null}>{navDrawer}</Suspense>
      <Suspense fallback={null}>{auctionRealtime}</Suspense>
      {!isHidden && header}
      {children}
      {!isHidden && <Footer />}
    </Elements>
  )
}
