import './globals.css'
import { SessionProvider } from 'next-auth/react'
import { RootLayoutWrapper } from './root-layout'
import { getCachedAuction } from '../lib/actions/public/auction/getCachedAuction'
import { cookies } from 'next/headers'
import { bebas, nunito, quicksand, workSans } from './fonts'

export { metadata } from './metadata'
export { viewport } from './viewport'

const fontVariables = [quicksand.variable, workSans.variable, bebas.variable, nunito.variable].join(
  ' '
)

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [cookieStore, auction] = await Promise.all([cookies(), getCachedAuction()])

  const hasActiveFee = cookieStore.get('lpdr_active_adoption_fee')?.value === '1'

  const isAuthed = !!(
    cookieStore.get('authjs.session-token') ?? cookieStore.get('__Secure-authjs.session-token')
  )

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if(matchMedia('(prefers-color-scheme: dark)').matches)document.documentElement.classList.add('dark')`
          }}
        />
      </head>
      <body className={fontVariables}>
        <SessionProvider refetchOnWindowFocus={false}>
          <RootLayoutWrapper auction={auction} hasActiveFee={hasActiveFee} isAuthed={isAuthed}>
            {children}
          </RootLayoutWrapper>
        </SessionProvider>
      </body>
    </html>
  )
}
