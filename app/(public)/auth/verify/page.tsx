import Link from 'next/link'
import { VerifyButton } from './_components/VerifyButton'

/** Loading this page consumes nothing. Only the button reaches the callback. */
function isValidCallback(callback: string | undefined) {
  if (!callback) return false

  try {
    const url = new URL(callback)
    const base = new URL(process.env.NEXT_PUBLIC_SITE_URL!)

    return url.origin === base.origin && url.pathname.startsWith('/api/auth/callback/')
  } catch {
    return false
  }
}

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ callback?: string }> }) {
  const { callback } = await searchParams
  const valid = isValidCallback(callback)

  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center bg-bg-light dark:bg-bg-dark px-4">
      <div className="w-full max-w-sm border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="block w-6 h-px bg-primary-light dark:bg-primary-dark shrink-0" aria-hidden="true" />
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
            Little Paws
          </span>
        </div>

        {valid ? (
          <>
            <h1 className="font-quicksand font-black text-2xl text-text-light dark:text-text-dark leading-tight mb-3">
              Confirm sign in
            </h1>
            <p className="text-xs font-mono text-muted-light dark:text-muted-dark leading-relaxed mb-6">
              Press the button below to finish signing in to your account.
            </p>
            <VerifyButton callback={callback!} />
          </>
        ) : (
          <>
            <h1 className="font-quicksand font-black text-2xl text-text-light dark:text-text-dark leading-tight mb-3">
              This link has expired
            </h1>
            <p className="text-xs font-mono text-muted-light dark:text-muted-dark leading-relaxed mb-6">
              Sign in links are good for 15 minutes. Request a new one and it will arrive in a moment.
            </p>

            <Link
              href="/auth/login"
              className="block w-full py-3 text-center bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark text-white text-[10px] font-mono font-black tracking-[0.25em] uppercase transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark focus-visible:ring-offset-2"
            >
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </main>
  )
}
