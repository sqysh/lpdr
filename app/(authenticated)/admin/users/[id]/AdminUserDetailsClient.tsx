'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Role } from '@prisma/client'
import {
  Mail,
  Phone,
  Shield,
  Clock,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Check,
  Package,
  ChevronRight,
  AlertCircle,
  Info,
  CreditCard
} from 'lucide-react'
import Link from 'next/link'
import { formatDate } from 'app/utils/_date.utils'
import { formatRole } from 'app/utils/_user.utils'
import AdminPageHeader from 'app/components/admin/_shared/AdminPageHeader'
import { StatusPill } from 'app/components/_primitives'
import { MergeUserSection } from 'app/components/admin/user/MergeUserSection'
import { updateUserRole } from 'app/lib/actions/admin/user/updateUserRole'
import { getUserById } from 'app/lib/actions/admin/user/getUserById'
import Picture from 'app/components/_common/Picture'
import { MigrationTroubleshootPanel } from 'app/components/admin/user/MigrationTroubleShootPanel'

type UserDetail = NonNullable<Awaited<ReturnType<typeof getUserById>>['data']>

const ASSIGNABLE_ROLES: Role[] = ['ADMIN', 'PACK_MEMBER']

function Field({
  icon: Icon,
  label,
  children
}: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border-light dark:border-border-dark last:border-b-0">
      <Icon
        className="w-4 h-4 text-muted-light dark:text-muted-dark shrink-0 mt-0.5"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-0.5">
          {label}
        </p>
        <div className="text-sm text-text-light dark:text-text-dark wrap-break-word">
          {children}
        </div>
      </div>
    </div>
  )
}

type Props = {
  user: UserDetail
  migrationStatus: { hasPendingMigration: boolean; pendingCount: number } | null
  loggedInUser: { role: Role; id: string }
}

export default function AdminUserDetailsClient({ user, migrationStatus, loggedInUser }: Props) {
  const router = useRouter()

  const [role, setRole] = useState<Role>(user.role)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'role' | 'merge'>('role')

  const dirty = role !== user.role
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Unnamed user'
  const totalSpent = user.orders
    .filter((o: { status: string }) => o.status === 'CONFIRMED')
    .reduce((sum: number, o: { totalAmount: number }) => sum + Number(o.totalAmount), 0)

  async function handleSave() {
    if (!dirty || saving) return
    setSaving(true)
    setError(null)
    const result = await updateUserRole(user.id, role)
    setSaving(false)
    if (result.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      router.refresh()
    } else {
      setError(result.error ?? 'Something went wrong')
      setRole(user.role)
    }
  }

  const hasMigratedOrders = user.orders.some((o) => o.source === 'MONGO_MIGRATION')

  return (
    <main id="main-content" className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
      <AdminPageHeader
        title={fullName}
        breadcrumbs={[{ label: 'Users', href: '/admin/users' }]}
        action={
          migrationStatus?.hasPendingMigration ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/5 text-[9px] font-mono tracking-[0.15em] uppercase">
              <AlertCircle className="w-3 h-3" aria-hidden="true" />
              Migration pending ({migrationStatus.pendingCount})
            </span>
          ) : user.hasMigrated ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 text-[9px] font-mono tracking-[0.15em] uppercase">
              <CheckCircle className="w-3 h-3" aria-hidden="true" />
              Migrated
            </span>
          ) : null
        }
      />

      <div className="w-full px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-6 items-start">
          {/* ── Left column ── */}
          <div className="space-y-6">
            {/* Identity */}
            <section>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 shrink-0 flex items-center justify-center bg-primary-light/10 dark:bg-primary-dark/10 border border-primary-light/30 dark:border-primary-dark/30 overflow-hidden">
                  {user.image ? (
                    <Picture
                      priority={true}
                      src={user.image}
                      alt=""
                      className="w-full h-full object-cover"
                      unoptimized={false}
                    />
                  ) : (
                    <span className="font-quicksand font-black text-lg text-primary-light dark:text-primary-dark">
                      {(user.firstName?.[0] ?? user.email[0]).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-text-light dark:text-text-dark truncate">
                    {fullName}
                  </h2>
                  <p className="text-sm text-muted-light dark:text-muted-dark truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              {user.hasMigrated && !hasMigratedOrders && (
                <div className="flex items-start gap-2.5 px-3.5 py-3 mt-3 border border-primary-light/30 dark:border-primary-dark/30 bg-primary-light/5 dark:bg-primary-dark/5 mb-6">
                  <Info
                    className="w-3.5 h-3.5 text-primary-light dark:text-primary-dark shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <p className="text-[11px] font-mono text-text-light dark:text-text-dark leading-relaxed">
                    Migration ran successfully. This user had no orders, donations, or other history
                    on the previous site.
                  </p>
                </div>
              )}

              <div className="border border-border-light dark:border-border-dark px-4">
                <Field icon={Mail} label="Email">
                  {user.email}
                </Field>
                {user.phone && (
                  <Field icon={Phone} label="Phone">
                    {user.phone || <span className="text-muted-light dark:text-muted-dark">—</span>}
                  </Field>
                )}
                <Field icon={Shield} label="Current role">
                  {formatRole(user.role)}
                </Field>
                <Field icon={CheckCircle} label="Status">
                  {user.status}
                </Field>
                <Field icon={user.emailVerified ? CheckCircle : XCircle} label="Email verified">
                  {user.emailVerified ? (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Verified {formatDate(user.emailVerified)}
                    </span>
                  ) : (
                    <span className="text-muted-light dark:text-muted-dark">Not verified</span>
                  )}
                </Field>
                <Field icon={Clock} label="Last login">
                  {user.lastLoginAt ? (
                    formatDate(user.lastLoginAt)
                  ) : (
                    <span className="text-muted-light dark:text-muted-dark">Never</span>
                  )}
                </Field>
                <Field icon={Calendar} label="Joined">
                  {formatDate(user.createdAt)}
                </Field>
                {(user.lastGeoCity || user.lastGeoRegion || user.lastGeoCountry) && (
                  <Field icon={MapPin} label="Last location">
                    {[user.lastGeoCity, user.lastGeoRegion, user.lastGeoCountry]
                      .filter(Boolean)
                      .join(', ')}
                  </Field>
                )}
              </div>
            </section>

            {/* Payment methods */}
            <section className="border border-border-light dark:border-border-dark divide-y divide-border-light dark:divide-border-dark">
              <div className="px-4 py-3 flex items-center justify-between">
                <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
                  Payment methods
                </p>
                <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark">
                  {user.paymentMethods.length} saved
                </span>
              </div>
              {user.paymentMethods.length === 0 ? (
                <div className="px-4 py-3 flex items-center gap-2 text-muted-light dark:text-muted-dark">
                  <CreditCard className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <p className="font-mono text-[11px]">No saved payment methods</p>
                </div>
              ) : (
                user.paymentMethods.map((pm) => (
                  <div key={pm.id} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <CreditCard
                        className="w-3.5 h-3.5 shrink-0 text-muted-light dark:text-muted-dark"
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="font-mono text-[11px] text-text-light dark:text-text-dark capitalize">
                          {pm.cardBrand} ···· {pm.cardLast4}
                          {pm.isDefault && (
                            <span className="ml-2 text-[8px] tracking-widest uppercase text-primary-light dark:text-primary-dark">
                              Default
                            </span>
                          )}
                        </p>
                        <p className="font-mono text-[10px] text-muted-light dark:text-muted-dark">
                          {pm.cardholderName ?? '—'} · Exp {pm.cardExpMonth}/{pm.cardExpYear}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </section>

            {/* Tabbed: Role + Merge */}
            {((user.role !== 'SUPER_USER' && loggedInUser.id !== user.id) ||
              loggedInUser.role === 'SUPER_USER') && (
              <section className="border border-border-light dark:border-border-dark">
                {/* Tab headers */}
                <div className="flex border-b border-border-light dark:border-border-dark">
                  {(['role', 'merge'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTab(t)}
                      className={`px-4 py-2.5 font-mono text-[9px] tracking-[0.2em] uppercase transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark ${
                        tab === t
                          ? 'text-text-light dark:text-text-dark border-b-2 border-primary-light dark:border-primary-dark -mb-px'
                          : 'text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark'
                      }`}
                    >
                      {t === 'role' ? 'Change role' : 'Merge accounts'}
                    </button>
                  ))}
                </div>

                {/* Role tab */}
                {tab === 'role' && (
                  <div className="p-5">
                    <p className="text-[13px] text-muted-light dark:text-muted-dark leading-relaxed mb-3">
                      Admins can manage the site. Supporters are regular members.
                    </p>

                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-5 border border-primary-light/40 dark:border-primary-dark/40 text-primary-light dark:text-primary-dark text-[9px] font-mono tracking-[0.15em] uppercase">
                      Currently {formatRole(user.role)}
                    </div>

                    <div className="flex flex-col gap-2.5 mb-5">
                      {ASSIGNABLE_ROLES.map((r) => {
                        const selected = role === r
                        const isCurrent = user.role === r
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setRole(r)}
                            aria-pressed={selected}
                            className={`relative w-full px-4 py-3.5 text-left border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark ${
                              selected
                                ? 'border-primary-light dark:border-primary-dark bg-primary-light/5 dark:bg-primary-dark/5'
                                : 'border-border-light dark:border-border-dark hover:border-muted-light dark:hover:border-muted-dark'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <p
                                className={`text-[11px] font-mono tracking-[0.15em] uppercase font-bold ${
                                  selected
                                    ? 'text-primary-light dark:text-primary-dark'
                                    : 'text-text-light dark:text-text-dark'
                                }`}
                              >
                                {formatRole(r)}
                              </p>
                              {isCurrent && (
                                <span className="text-[8px] font-mono tracking-widest uppercase text-muted-light dark:text-muted-dark">
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark mt-1">
                              {r === 'ADMIN' ? 'Full site management' : 'Regular member access'}
                            </p>
                          </button>
                        )
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={!dirty || saving}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-[10px] font-mono tracking-[0.2em] uppercase bg-primary-light dark:bg-primary-dark text-white dark:text-bg-dark transition-colors hover:bg-secondary-light dark:hover:bg-secondary-dark disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                    >
                      {saved ? (
                        <>
                          <Check className="w-3.5 h-3.5" aria-hidden="true" /> Saved
                        </>
                      ) : saving ? (
                        'Saving...'
                      ) : (
                        'Save role'
                      )}
                    </button>

                    {error && (
                      <p
                        role="alert"
                        className="mt-3 font-mono text-[11px] text-red-600 dark:text-red-400"
                      >
                        {error}
                      </p>
                    )}
                  </div>
                )}

                {/* Merge tab */}
                {tab === 'merge' && (
                  <div className="p-5">
                    <MergeUserSection userId={user.id} userEmail={user.email} />
                  </div>
                )}
              </section>
            )}
          </div>
          {/* ── Right column — orders ── */}
          <div className="space-y-4">
            {loggedInUser.role === 'SUPER_USER' && <MigrationTroubleshootPanel userId={user.id} />}
            {/* Total spent stat */}
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-border-light dark:border-border-dark p-4">
                <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-1">
                  Total spent
                </p>
                <p className="font-quicksand text-2xl font-black text-text-light dark:text-text-dark">
                  ${totalSpent.toFixed(2)}
                </p>
              </div>
              <div className="border border-border-light dark:border-border-dark p-4">
                <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-1">
                  Orders
                </p>
                <p className="font-quicksand text-2xl font-black text-text-light dark:text-text-dark">
                  {user.orders.length}
                </p>
              </div>
            </div>

            {/* Orders list */}
            <section>
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark mb-3">
                Order history
              </p>

              {user.orders.length === 0 ? (
                <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark">
                  No orders yet
                </p>
              ) : (
                <div className="border border-border-light dark:border-border-dark divide-y divide-border-light dark:divide-border-dark">
                  {user.orders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/admin/orders/${order.id}`}
                      className="flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-primary-light/5 dark:hover:bg-primary-dark/5 transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Package
                          className="w-3.5 h-3.5 text-muted-light dark:text-muted-dark shrink-0"
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-mono text-xs text-text-light dark:text-text-dark">
                              #{order.id.slice(-8)}
                            </p>
                            <StatusPill status={order.status} />
                          </div>
                          <p className="font-mono text-[10px] text-muted-light dark:text-muted-dark mt-0.5">
                            {order.type.replaceAll('_', ' ')} · {formatDate(order.createdAt)}
                          </p>
                          {order.items.length > 0 && (
                            <p className="font-mono text-[10px] text-muted-light dark:text-muted-dark truncate">
                              {order.items.map((i) => i.itemName ?? 'Item').join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <p className="font-mono text-sm font-bold text-text-light dark:text-text-dark tabular-nums">
                          ${Number(order.totalAmount).toFixed(2)}
                        </p>
                        <ChevronRight
                          className="w-3.5 h-3.5 text-muted-light dark:text-muted-dark group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors"
                          aria-hidden="true"
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
