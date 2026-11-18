import type { Metadata } from 'next'
import { requireAdminPage } from 'lib/auth/guards'
import { BrandPresentation } from './_components/BrandPresentation'

export const metadata: Metadata = {
  title: 'Brand identity',
  robots: { index: false, follow: false }
}

export default async function BrandIdentityPresentationPage() {
  // The admin layout checks this too, but a page can render without its layout, so it checks for itself
  await requireAdminPage()
  return <BrandPresentation />
}
