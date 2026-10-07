import { requireAccessPage } from 'lib/auth/guards'

export default async function ApplicationsLayout({ children }: { children: React.ReactNode }) {
  await requireAccessPage('APPLICATIONS')
  return children
}
