import './globals.css'
import { SessionProvider } from 'next-auth/react'
import { RootLayoutWrapper } from './root-layout'
import { bebas, nunito, quicksand, workSans, signatureFont } from './fonts'
import { SiteNavigationDrawer } from 'components/layout/navigation-drawer/SiteNavigationDrawer'
import { Header } from 'components/layout/header/Header'
import { Analytics } from '@vercel/analytics/next'

export { metadata } from './metadata'
export { viewport } from './viewport'

const fontVariables = [quicksand, workSans, bebas, nunito, signatureFont].map((f) => f.variable).join(' ')

const themeScript = `(function(){try{if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark')}}catch(e){}})()`

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={fontVariables}>
        {process.env.NEXT_PUBLIC_APP_ENV === 'staging' && (
          <div role="note" className="bg-amber-400 text-black text-center text-[11px] font-mono uppercase tracking-widest px-4 py-1.5">
            Staging site: test cards only. Nothing here affects the real site.
          </div>
        )}
        <SessionProvider refetchOnWindowFocus={false}>
          <RootLayoutWrapper header={<Header />} navDrawer={<SiteNavigationDrawer />}>
            {children}
          </RootLayoutWrapper>
        </SessionProvider>
        <Analytics debug={false} />
      </body>
    </html>
  )
}
