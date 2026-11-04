import Link from 'next/link'
import { INBOX, mailto } from 'lib/constants/email.constants'

export default function TerminatedPage() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark flex items-center justify-center px-4"
    >
      <div className="w-full max-w-md">
        <div className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="block w-6 h-px bg-secondary-light dark:bg-secondary-dark shrink-0" aria-hidden="true" />
            <p className="text-[10px] font-mono tracking-eyebrow uppercase text-secondary-light dark:text-secondary-dark">Account Closed</p>
          </div>

          <h1 className="font-quicksand text-2xl font-bold text-text-light dark:text-text-dark mb-3">This account is no longer active</h1>
          <p className="text-sm text-muted-light dark:text-muted-dark leading-relaxed mb-8">
            Your account has been closed and can no longer be used to sign in. If you have questions about this decision, you&apos;re
            welcome to get in touch with our team.
          </p>

          <div className="flex flex-col gap-3">
            <a
              href={mailto(INBOX.general, 'Account Closure')}
              className="w-full text-center px-6 py-3.5 bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark text-white text-[10px] font-mono font-black tracking-[0.25em] uppercase transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              Contact Us
            </a>
            <Link
              href="/"
              className="w-full text-center px-6 py-3 text-[10px] font-mono tracking-eyebrow uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
