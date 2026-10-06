import PublicNewslettersClient from 'app/(public)/newsletters/PublicNewslettersClient'
import getPublishedNewsletterIssues from 'lib/actions/public/newsletter-issue/getPublishedNewsletterIssues'

export default async function PublicNewslettersPage() {
  const result = await getPublishedNewsletterIssues()
  return <PublicNewslettersClient issues={result.data} />
}
