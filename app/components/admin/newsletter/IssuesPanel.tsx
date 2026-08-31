import { NewsletterIssue } from '@prisma/client'
import deleteNewsletterIssue from 'lib/actions/admin/newsletter-issue/deleteNewsletterIssue'
import { showToast } from 'lib/store/slices/toastSlice'
import { useAppDispatch } from 'lib/store/store'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ExternalLink, FileText, Plus, Trash2 } from 'lucide-react'
import { NewsletterIssueModal } from './NewsletterIssueModal'
import AdminHeaderButton from 'app/components/admin/_shared/AdminHeaderButton'
import AdminTable, { Column } from 'app/components/admin/_shared/AdminTable'

export function IssuesPanel({ issues }: { issues: NewsletterIssue[] }) {
  const router = useRouter()
  const [toggleNewsletterIssueModal, setToggleNewsletterIssueModal] = useState(false)
  const onClose = () => setToggleNewsletterIssueModal(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const dispatch = useAppDispatch()

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const result = await deleteNewsletterIssue(id)
    setDeletingId(null)
    setConfirmId(null)

    if (result.success) {
      dispatch(
        showToast({
          type: 'success',
          message: 'Issue deleted',
          description: result.data ? `${result.data.month} ${result.data.year}` : undefined
        })
      )
      router.refresh()
    } else {
      dispatch(showToast({ type: 'error', message: result.error ?? 'Failed to delete issue' }))
    }
  }

  const columns: Column<NewsletterIssue>[] = [
    {
      header: 'Issue',
      className: 'min-w-0',
      cell: (issue) => (
        <p className="text-xs font-mono font-medium text-text-light dark:text-text-dark truncate">
          {issue.month} {issue.year}
        </p>
      )
    },
    {
      header: 'Status',
      className: 'whitespace-nowrap',
      cell: (issue) => (
        <span
          className={`inline-flex items-center gap-1.5 text-[9px] font-mono tracking-[0.15em] uppercase ${
            issue.isLive
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-amber-600 dark:text-amber-400'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 shrink-0 ${issue.isLive ? 'bg-emerald-500' : 'bg-amber-500'}`}
            aria-hidden="true"
          />
          {issue.isLive ? 'Live' : 'Draft'}
        </span>
      )
    },
    {
      header: 'PDF',
      className: 'whitespace-nowrap',
      cell: (issue) => (
        <a
          href={issue.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${issue.month} ${issue.year} PDF in new tab`}
          className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark hover:text-secondary-light dark:hover:text-secondary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          <FileText size={11} aria-hidden="true" />
          Open PDF
          <ExternalLink size={10} aria-hidden="true" />
        </a>
      )
    },
    {
      header: '',
      className: 'whitespace-nowrap text-right',
      cell: (issue) =>
        confirmId === issue.id ? (
          <span className="inline-flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDelete(issue.id)}
              disabled={deletingId === issue.id}
              className="text-[10px] font-mono tracking-[0.2em] uppercase text-red-600 dark:text-red-400 hover:underline disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              {deletingId === issue.id ? 'Deleting...' : 'Confirm'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmId(null)}
              disabled={deletingId === issue.id}
              className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
            >
              Cancel
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmId(issue.id)}
            aria-label={`Delete ${issue.month} ${issue.year} issue`}
            className="inline-flex p-1.5 text-muted-light dark:text-muted-dark hover:text-red-600 dark:hover:text-red-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <Trash2 size={14} aria-hidden="true" />
          </button>
        )
    }
  ]

  return (
    <>
      <NewsletterIssueModal
        key={toggleNewsletterIssueModal ? 'open' : 'closed'}
        isOpen={toggleNewsletterIssueModal}
        onClose={onClose}
      />

      <div className="w-full px-4 sm:px-6 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
            {issues.length} issue{issues.length !== 1 ? 's' : ''}
          </p>
          <AdminHeaderButton
            onClick={() => setToggleNewsletterIssueModal(true)}
            icon={<Plus size={11} aria-hidden="true" />}
            ariaLabel="Create new newsletter issue"
          >
            New Issue
          </AdminHeaderButton>
        </div>

        <AdminTable
          columns={columns}
          rows={issues}
          rowKey={(issue) => issue.id}
          caption="Newsletter issues"
          emptyMessage="No issues published yet"
        />
      </div>
    </>
  )
}
