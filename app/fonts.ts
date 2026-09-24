import { Bebas_Neue, Caveat, Nunito, Quicksand, Work_Sans } from 'next/font/google'

export const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  preload: false,
  variable: '--font-work-sans'
})
export const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  preload: false,
  variable: '--font-quicksand'
})

export const nunito = Nunito({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  preload: false,
  variable: '--font-nunito'
})

export const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  preload: false,
  variable: '--font-bebas'
})

export const signatureFont = Caveat({ subsets: ['latin'], weight: ['500'], variable: '--font-caveat' })
