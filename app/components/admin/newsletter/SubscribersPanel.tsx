import { Newsletter } from '@prisma/client'
import { PAGE_SIZE } from 'lib/constants/newsletter.constants'
import { useMemo, useState } from 'react'
import { formatDate } from 'app/utils/_date.utils'
import { Check, Copy, Search, X } from 'lucide-react'
import AdminTable, { Column } from 'app/components/admin/_shared/AdminTable'
import { Pagination } from 'app/components/_common/Pagination'

export function SubscribersPanel({ newsletters }: { newsletters: Newsletter[] }) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState(false)

  const filtered = useMemo(() => {
    if (!search.trim()) return newsletters
    return newsletters.filter((n) => n.newsletterEmail.toLowerCase().includes(search.toLowerCase()))
  }, [newsletters, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const handleSearch = (val: string) => {
    setSearch(val)
    setPage(1)
  }

  const handleCopyAll = async () => {
    const emails = filtered.map((n) => n.newsletterEmail).join(', ')
    try {
      await navigator.clipboard.writeText(emails)
    } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const columns: Column<Newsletter>[] = [
    {
      header: 'Email',
      className: 'text-xs font-mono text-text-light dark:text-text-dark',
      cell: (n) => (
        <span className="truncate block" title={n.newsletterEmail}>
          {n.newsletterEmail}
        </span>
      )
    },
    {
      header: 'Subscribed',
      className:
        'text-[10px] font-mono tracking-widest text-muted-light dark:text-muted-dark whitespace-nowrap',
      cell: (n) => formatDate(new Date(n.createdAt))
    }
  ]

  return (
    <div className="w-full px-4 sm:px-6 py-6 space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={12}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search subscribers..."
            aria-label="Search newsletter subscribers"
            className="w-full pl-8 pr-8 py-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-[10px] font-mono tracking-[0.2em] text-text-light dark:text-text-dark placeholder:text-muted-light dark:placeholder:text-muted-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark transition-colors"
          />
          {search && (
            <button
              type="button"
              onClick={() => handleSearch('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              <X size={11} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark whitespace-nowrap">
            {filtered.length} subscriber{filtered.length !== 1 ? 's' : ''}
          </p>
          <button
            type="button"
            onClick={handleCopyAll}
            disabled={filtered.length === 0}
            aria-label={
              copied
                ? 'Emails copied to clipboard'
                : 'Copy all emails to clipboard as comma-separated list'
            }
            className="inline-flex items-center gap-2 px-3 py-2 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark hover:border-primary-light dark:hover:border-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {copied ? (
              <Check size={11} aria-hidden="true" />
            ) : (
              <Copy size={11} aria-hidden="true" />
            )}
            {copied ? 'Copied' : 'Copy all emails'}
          </button>
        </div>
      </div>

      {/* Table */}
      <AdminTable
        columns={columns}
        rows={paginated}
        rowKey={(n) => n.id}
        caption="Newsletter subscribers"
        emptyMessage={search ? 'No subscribers match your search' : 'No subscribers yet'}
      />

      {totalPages > 1 && (
        <Pagination
          page={safePage}
          totalPages={totalPages}
          onPage={setPage}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
        />
      )}
    </div>
  )
}
