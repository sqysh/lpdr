import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/auth', '/my-pack', '/api', '/checkout', '/order-confirmation', '/(authenticated)']
      }
    ],
    sitemap: 'https://www.littlepawsdr.org/sitemap.xml'
  }
}
