import { redirect } from 'next/navigation'
import { CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { verifyEmailChange } from 'lib/actions/my-pack/email-change/verifyEmailChange'

export default async function VerifyEmailChangePage({
  searchParams
}: {
  searchParams: { token?: string }
}) {
  if (!searchParams.token) redirect('/my-pack')

  const result = await verifyEmailChange(searchParams.token)

  return (
    <main className="min-h-screen bg-bg-light dark:bg-bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {result.success ? (
          <>
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-emerald-500" aria-hidden="true" />
            </div>
            <h1 className="text-2xl uppercase tracking-wide text-text-light dark:text-text-dark mb-3">
              Email Updated
            </h1>
            <p className="font-mono text-sm text-muted-light dark:text-muted-dark mb-8 leading-relaxed">
              Your email address has been successfully updated. Use your new email to sign in going
              forward.
            </p>
            <Link
              href="/my-pack"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark text-white text-[10px] font-mono tracking-[0.25em] uppercase transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              Go to My Pack
            </Link>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <XCircle className="w-12 h-12 text-red-500" aria-hidden="true" />
            </div>
            <h1 className="text-2xl uppercase tracking-wide text-text-light dark:text-text-dark mb-3">
              Verification Failed
            </h1>
            <p className="font-mono text-sm text-muted-light dark:text-muted-dark mb-8 leading-relaxed">
              {result.error}
            </p>
            <Link
              href="/my-pack"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark text-white text-[10px] font-mono tracking-[0.25em] uppercase transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              Back to My Pack
            </Link>
          </>
        )}
      </div>
    </main>
  )
}
