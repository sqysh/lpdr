'use client'

import { ReactNode, Suspense, useEffect, useRef, useState } from 'react'
import { Provider } from 'react-redux'
import { store } from '../lib/store/store'
import { Elements } from '@stripe/react-stripe-js'
import { Confetti3D } from './components/_common/Confetti3D'
import { Toast } from './components/_common/Toast'
import { ThemeProvider } from '../lib/providers/theme.provider'
import { usePathname, useRouter, useSelectedLayoutSegments } from 'next/navigation'
import { HIDDEN_PATHS } from '../lib/constants/navigation.constants'
import { stripePromise } from '../lib/stripe/stripe-promise'
import { pusherClient } from '../lib/pusher/pusher-client'
import NavigationDrawer from './components/layout/navigation-drawer/NavigationDrawer'
import { AuctionEndedData, AuctionStartedData } from 'types/_auction'
import Header from './components/layout/header/Header'
import Footer from './components/layout/footer/Footer'
import { AuctionStartedModal } from './components/features/auction/modals/AuctionStartedModal'
import { CartBar } from './components/features/cart/CartBar'
import { CartToast } from './components/features/cart/CartToast'
import PublicContactModal from './components/features/home/PublicContactModal'
import { CartPersistence } from './components/features/cart/CartPersistence'
import { AuctionEndedModal } from './components/features/auction'
import { AuthRedirectWatcher } from './components/features/login/AuthRedirectWatcher'
import { CookieConsentBanner } from './components/layout/CookieConsentBanner'
import { FixedDonateTab } from './components/layout/FixedDonateTab'

interface Props {
  children: ReactNode
  auction: any
  hasActiveFee: boolean
  isAuthed: boolean
}

export function RootLayoutWrapper({ children, auction, hasActiveFee, isAuthed }: Props) {
  const segments = useSelectedLayoutSegments()
  const isNotFound = segments[0] === '__DEFAULT__' || segments.includes('/_not-found')
  const pathname = usePathname()
  const isHidden = HIDDEN_PATHS.some((path) => pathname.startsWith(path)) || isNotFound

  const router = useRouter()
  const routerRef = useRef(router)

  const activeAuctionId = auction?.id ?? null

  const [auctionStartedData, setAuctionStartedData] = useState<AuctionStartedData | null>(null)
  const [auctionEndedData, setAuctionEndedData] = useState<AuctionEndedData | null>(null)

  useEffect(() => {
    routerRef.current = router
  }, [router])

  useEffect(() => {
    if (!activeAuctionId) return

    const channel = pusherClient.subscribe(`auction-${activeAuctionId}`)

    channel.bind('auction-started', (data: AuctionStartedData) => {
      routerRef.current.refresh()
      setAuctionStartedData(data)
    })
    channel.bind('auction-ended', (data: any) => {
      routerRef.current.refresh()
      setAuctionEndedData(data)
    })

    return () => {
      channel.unbind_all()
      pusherClient.unsubscribe(`auction-${activeAuctionId}`)
    }
  }, [activeAuctionId])

  const [burstTrigger, setBurstTrigger] = useState(0)

  // expose via context or prop — simplest is a window event
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
          <AuctionEndedModal data={auctionEndedData} onClose={() => setAuctionEndedData(null)} />
          <AuctionStartedModal
            data={auctionStartedData}
            onClose={() => setAuctionStartedData(null)}
          />
          <CartBar />
          <CartToast />
          <PublicContactModal />
          <Suspense fallback={null}>
            <NavigationDrawer auction={auction} hasActiveFee={hasActiveFee} />
          </Suspense>
          <CartPersistence />
          {!isHidden && (
            <Header auction={auction} hasActiveFee={hasActiveFee} isAuthed={isAuthed} />
          )}
          {children}
          {!isHidden && <Footer />}
        </Elements>
      </ThemeProvider>
    </Provider>
  )
}
