import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Pagination({
  page,
  totalPages,
  onPage,
  totalItems,
  pageSize
}: {
  page: number
  totalPages: number
  onPage: (p: number) => void
  totalItems: number
  pageSize: number
}) {
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  // Build page number list with ellipsis
  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex flex-col xs:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
      {/* Count */}
      <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark order-2 xs:order-1">
        {start}–{end} of {totalItems}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1 order-1 xs:order-2" role="navigation" aria-label="Pagination">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className="w-8 h-8 flex items-center justify-center border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark hover:border-primary-light/40 dark:hover:border-primary-dark/40 transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          <ChevronLeft size={13} aria-hidden="true" />
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span
              key={`ellipsis-${i}`}
              className="w-8 h-8 flex items-center justify-center text-[10px] font-mono text-muted-light dark:text-muted-dark"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              aria-label={`Page ${p}`}
              aria-current={page === p ? 'page' : undefined}
              className={`w-8 h-8 flex items-center justify-center text-[10px] font-mono border transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark ${
                page === p
                  ? 'bg-primary-light dark:bg-primary-dark border-primary-light dark:border-primary-dark text-white'
                  : 'border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark hover:border-primary-light/40 dark:hover:border-primary-dark/40'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
          className="w-8 h-8 flex items-center justify-center border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark hover:border-primary-light/40 dark:hover:border-primary-dark/40 transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          <ChevronRight size={13} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
