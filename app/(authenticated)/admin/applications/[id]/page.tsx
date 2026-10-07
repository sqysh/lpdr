import { notFound } from 'next/navigation'
import { getApplicationById } from 'lib/actions/admin/application/getApplicationById'
import { ApplicationDetailClient } from './ApplicationDetailClient'

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getApplicationById(id)

  if (!result.success) {
    if (result.error === 'Application not found') notFound()
    // Anything else is a real failure, so the error boundary shows it instead of a misleading 404
    throw new Error(result.error)
  }

  // Keyed on updatedAt so the form fields reset to the saved values after every change
  return <ApplicationDetailClient key={String(result.data.application.updatedAt)} {...result.data} />
}
