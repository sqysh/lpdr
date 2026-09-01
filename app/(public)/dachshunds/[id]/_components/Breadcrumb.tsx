import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export function Breadcrumb({ a }) {
  const searchParams = useSearchParams()
  const from = searchParams.get('from')

  const BREADCRUMB_LABELS: Record<string, string> = {
    '/dachshunds': 'Dachshunds',
    '/dachshunds/hold': 'On Hold Dachshunds'
  }
  return (
    <nav aria-label="Breadcrumb" className="1200:sticky 1200:top-0 px-4 sm:px-6 lg:px-8 pt-6 pb-2">
      <ol className="max-w-180 1000:max-w-240 1200:max-w-300 mx-auto flex items-center gap-2 text-xs text-muted-light dark:text-muted-dark flex-wrap">
        <li>
          <Link
            href="/"
            className="hover:text-primary-light dark:hover:text-primary-dark transition-colors focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark outline-none"
          >
            Home
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link
            href={from ?? '/dachshunds'}
            className="hover:text-primary-light dark:hover:text-primary-dark transition-colors focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark outline-none"
          >
            {BREADCRUMB_LABELS[from ?? ''] ?? 'Dachshunds'}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li className="text-text-light dark:text-text-dark font-medium" aria-current="page">
          {a?.name}
        </li>
      </ol>
    </nav>
  )
}
