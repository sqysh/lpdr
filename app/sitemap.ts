export const dynamic = 'force-dynamic'

import { MetadataRoute } from 'next'
import { getDachshundsByStatus } from './lib/actions/_rescue-groups/getDachshundsByStatus'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://littlepawsdr.org'

  let dachshundPages: MetadataRoute.Sitemap = []
  try {
    const data = await getDachshundsByStatus({
      status: 'Available',
      currentPage: 1,
      pageLimit: 250,
      source: 'sitemap'
    })
    dachshundPages = data?.data?.data.map((dachshund) => ({
      url: `${baseUrl}/dachshunds/${dachshund.id}`,
      lastModified: dachshund.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7
    }))
  } catch {
    // DB unreachable at build time — concert pages omitted from sitemap
  }

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0
    },
    {
      url: `${baseUrl}/dachshunds`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8
    },
    {
      url: `${baseUrl}/dachshunds/hold`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8
    },
    {
      url: `${baseUrl}/dachshunds/surrender`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/donate`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/welcomewieners`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8
    },
    {
      url: `${baseUrl}/shoptohelp`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8
    },
    {
      url: `${baseUrl}/feed`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8
    },
    {
      url: `${baseUrl}/adopt/application`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8
    },
    {
      url: `${baseUrl}/adopt/senior`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7
    },
    {
      url: `${baseUrl}/adopt/info`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/adopt/fees`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/adopt/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/volunteer/application`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/volunteer/foster`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/volunteer/transport`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/merch`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/subscriptions`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9
    }
  ]

  return [...staticPages, ...dachshundPages]
}
