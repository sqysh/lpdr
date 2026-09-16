import { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.littlepawsdr.org'),

  title: {
    default: 'Little Paws Dachshund Rescue',
    template: '%s | Little Paws Dachshund Rescue'
  },
  description:
    'We specialize in finding permanent homes for dachshunds and dachshund mixes. We strive to make the lives of all dogs better through action, advocacy, awareness, and education.',

  applicationName: 'Little Paws Dachshund Rescue',
  keywords: [
    'dachshund rescue',
    'dachshund adoption',
    'dog rescue',
    'East Coast dog rescue',
    'dachshund mixes',
    'foster dogs',
    'nonprofit dog rescue'
  ],

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.littlepawsdr.org',
    siteName: 'Little Paws Dachshund Rescue',
    title: 'Little Paws Dachshund Rescue',
    description:
      'We specialize in finding permanent homes for dachshunds and dachshund mixes. We strive to make the lives of all dogs better through action, advocacy, awareness, and education.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Little Paws Dachshund Rescue'
      }
    ]
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Little Paws Dachshund Rescue',
    description:
      'We specialize in finding permanent homes for dachshunds and dachshund mixes. We strive to make the lives of all dogs better through action, advocacy, awareness, and education.',
    images: ['/og-image.png']
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },

  alternates: {
    canonical: 'https://www.littlepawsdr.org'
  },

  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [{ url: '/icon-192.png', sizes: '192x192', type: 'image/png' }]
  }
}
