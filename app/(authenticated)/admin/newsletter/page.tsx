import AdminNewsletterPageClient from 'app/(authenticated)/admin/newsletter/AdminNewsletterClient'
import getNewsletterIssues from 'lib/actions/public/newsletter-issue/getNewsletterIssues'
import getNewsletters from 'lib/actions/admin/newsletter/getNewsletters'

export default async function AdminNewsletterPage() {
  const [newslettersResult, issuesResult] = await Promise.all([
    getNewsletters(),
    getNewsletterIssues()
  ])

  return (
    <AdminNewsletterPageClient
      newsletters={newslettersResult?.data ?? []}
      issues={issuesResult?.data ?? []}
    />
  )
}
