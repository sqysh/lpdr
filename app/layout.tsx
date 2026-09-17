import './globals.css'
import { SessionProvider } from 'next-auth/react'
import { RootLayoutWrapper } from './root-layout'
import { bebas, nunito, quicksand, workSans } from './fonts'
import { SiteNavigationDrawer } from 'components/layout/navigation-drawer/SiteNavigationDrawer'
import { Header } from 'components/layout/header/Header'
import { Analytics } from '@vercel/analytics/next'

export { metadata } from './metadata'
export { viewport } from './viewport'

const fontVariables = [quicksand, workSans, bebas, nunito].map((f) => f.variable).join(' ')

const themeScript = `(function(){try{if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark')}}catch(e){}})()`

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={fontVariables}>
        <SessionProvider refetchOnWindowFocus={false}>
          <RootLayoutWrapper header={<Header />} navDrawer={<SiteNavigationDrawer />}>
            {children}
          </RootLayoutWrapper>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  )
}
