import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.0.0.89'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.rescuegroups.org',
        pathname: '/5798/**'
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com'
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com'
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com'
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com https://maps.googleapis.com https://translate.google.com https://translate.googleapis.com https://translate-pa.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://cdn.rescuegroups.org https://lh3.googleusercontent.com https://platform-lookaside.fbsbx.com https://www.gstatic.com https://fonts.gstatic.com https://maps.gstatic.com https://*.googleapis.com",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://translate.google.com https://toolkit.rescuegroups.org",
              "connect-src 'self' https://api.stripe.com https://firebasestorage.googleapis.com wss://ws-us2.pusher.com https://sockjs-us2.pusher.com wss://ws-us3.pusher.com https://sockjs-us3.pusher.com https://www.google-analytics.com https://translate.googleapis.com https://translate-pa.googleapis.com https://maps.googleapis.com",
              "media-src 'self' https://firebasestorage.googleapis.com"
            ].join('; ')
          }
        ]
      }
    ]
  },
  async redirects() {
    return [
      { source: '/available', destination: '/dachshunds', permanent: true },
      { source: '/store', destination: '/merch', permanent: true },
      { source: '/donate/welcome-wieners', destination: '/welcomewieners', permanent: true },
      { source: '/donate/shop-to-help', destination: '/shoptohelp', permanent: true },
      { source: '/donate/feed-a-foster', destination: '/feed', permanent: true },
      {
        source: '/volunteer/volunteer-application',
        destination: '/volunteer/application',
        permanent: true
      },
      {
        source: '/volunteer/foster-application',
        destination: '/volunteer/foster',
        permanent: true
      },
      {
        source: '/volunteer/transport-application',
        destination: '/volunteer/transport',
        permanent: true
      }
    ]
  }
}

export default nextConfig
