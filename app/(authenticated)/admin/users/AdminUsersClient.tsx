'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowRight, CheckCircle, CreditCard, Minus, Search } from 'lucide-react'
import { formatDate } from 'app/utils/_date.utils'
import { IUser, RoleFilter } from 'types/_user'
import { formatRole } from 'app/utils/_user.utils'
import AdminPageHeader from 'app/components/admin/_shared/AdminPageHeader'
import AdminFilterTabs from 'app/components/admin/_shared/AdminFilterTabs'
import AdminTable, { type Column } from 'app/components/admin/_shared/AdminTable'
import { Pagination } from 'app/components/_common/Pagination'
import { PAGE_SIZE, ROLE_FILTER_LABELS, ROLE_FILTERS } from 'lib/constants/user.constants'
import { GrantAdminAccessModal } from 'app/components/admin/user/GrantAdminAccessModal'
import { PendingAdminInvitesList } from 'app/components/admin/user/PendingListInvites'
import { PendingAdminInvite } from '@prisma/client'
import { GrantAdminAccessTrigger } from 'app/components/admin/user/GrantAdminAccessTrigger'

const columns: Column<IUser>[] = [
  {
    header: 'Name',
    cell: (user) => {
      return (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-text-light dark:text-text-dark leading-snug">
              {user.firstName} {user.lastName}
            </p>
            {user.migrationStatus === 'pending' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/5 text-[8px] font-mono tracking-[0.15em] uppercase shrink-0">
                <AlertCircle className="w-2.5 h-2.5" aria-hidden="true" />
                Migration pending
              </span>
            )}
            {user.migrationStatus === 'migrated' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 text-[8px] font-mono tracking-[0.15em] uppercase shrink-0">
                <CheckCircle className="w-2.5 h-2.5" aria-hidden="true" />
                Migrated
              </span>
            )}
            {user.migrationStatus === 'not-needed' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark bg-bg-light dark:bg-bg-dark text-[8px] font-mono tracking-[0.15em] uppercase shrink-0">
                <Minus className="w-2.5 h-2.5" aria-hidden="true" />
                No prior history
              </span>
            )}
          </div>
          <p className="text-xs font-mono text-muted-light dark:text-muted-dark mt-0.5">
            {user.email}
          </p>
        </>
      )
    }
  },
  {
    header: 'Role',
    className: 'whitespace-nowrap',
    cell: (user) => (
      <span
        className={`text-[9px] font-black tracking-widest uppercase px-2 py-1 ${
          user.role === 'SUPER_USER'
            ? 'bg-purple-500/15 dark:bg-purple-400/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 dark:border-purple-400/30'
            : user.role === 'ADMIN'
              ? 'bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark'
              : 'bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark'
        }`}
      >
        {formatRole(user.role)}
      </span>
    )
  },
  {
    header: 'Payment',
    className: 'whitespace-nowrap',
    cell: (user) =>
      user.paymentMethodCount > 0 ? (
        <span className="inline-flex items-center gap-1 text-[9px] font-mono tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
          <CreditCard className="w-3 h-3" aria-hidden="true" />
          {user.paymentMethodCount}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-[9px] font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark">
          <Minus className="w-3 h-3" aria-hidden="true" />
          None
        </span>
      )
  },
  {
    header: 'Created',
    className: 'whitespace-nowrap text-xs font-mono text-muted-light dark:text-muted-dark',
    cell: (user) => formatDate(user.createdAt, true)
  },
  {
    header: '',
    className: 'sticky right-0 whitespace-nowrap text-right bg-surface-light dark:bg-surface-dark',
    headerClassName: 'sticky right-0 bg-surface-light dark:bg-surface-dark',
    cell: () => (
      <ArrowRight
        size={15}
        className="inline text-muted-light dark:text-muted-dark group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors"
        aria-hidden="true"
      />
    )
  }
]

export default function AdminUsersClient({
  users,
  pendingInvites
}: {
  users: IUser[]
  pendingInvites: PendingAdminInvite[]
}) {
  const router = useRouter()
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return users.filter((u) => {
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
      const matchesSearch =
        !q || [u.firstName, u.lastName, u.email].some((v) => v?.toLowerCase().includes(q))
      return matchesRole && matchesSearch
    })
  }, [users, roleFilter, search])

  const counts = useMemo(() => {
    const base = Object.fromEntries(ROLE_FILTERS.map((f) => [f, 0])) as Record<RoleFilter, number>
    base.ALL = users.length
    for (const u of users) {
      if (u.role in base) base[u.role as RoleFilter]++
    }
    return base
  }, [users])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function handleFilter(value: RoleFilter) {
    setRoleFilter(value)
    setPage(1)
  }

  function handleSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  return (
    <>
      <GrantAdminAccessModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        users={users}
        onGranted={() => router.refresh()}
      />

      <main id="main-content" className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
        <AdminPageHeader
          title="Users"
          count={{ value: filtered.length, noun: 'user' }}
          action={<GrantAdminAccessTrigger onClick={() => setModalOpen(true)} />}
        />

        <div className="w-full px-4 sm:px-6 py-6 space-y-6">
          <PendingAdminInvitesList invites={pendingInvites} onRevoked={() => router.refresh()} />

          {/* Toolbar: search + role filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <label htmlFor="user-search" className="sr-only">
                Search users
              </label>
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-light dark:text-muted-dark pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="user-search"
                type="search"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search name or email..."
                className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark placeholder:text-muted-light/50 dark:placeholder:text-muted-dark/50 transition-colors focus:outline-none focus-visible:border-primary-light dark:focus-visible:border-primary-dark"
              />
            </div>

            <AdminFilterTabs
              options={ROLE_FILTERS}
              value={roleFilter}
              onChange={handleFilter}
              counts={counts}
              labels={ROLE_FILTER_LABELS}
              label="Filter users by role"
            />
          </div>

          {/* Table */}
          <AdminTable
            columns={columns}
            rows={paginated}
            rowKey={(u) => u.id}
            caption="Users list"
            emptyMessage="No users found"
            onRowClick={(u) => router.push(`/admin/users/${u.id}`)}
            rowClassName={() =>
              'group cursor-pointer border-b border-border-light dark:border-border-dark last:border-0 hover:bg-surface-light dark:hover:bg-surface-dark transition-colors'
            }
          />

          {/* Pagination */}
          {filtered.length > PAGE_SIZE && (
            <Pagination
              page={safePage}
              totalPages={totalPages}
              onPage={setPage}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
            />
          )}
        </div>
      </main>
    </>
  )
}
