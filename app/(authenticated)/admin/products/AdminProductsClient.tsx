'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import AdminPageHeader from 'app/(authenticated)/admin/_components/AdminPageHeader'
import AdminHeaderButton from 'app/(authenticated)/admin/_components/AdminHeaderButton'
import AdminTable, { type Column } from 'app/(authenticated)/admin/_components/AdminTable'
import Picture from 'components/_common/Picture'
import { Product } from 'types/product'

const columns: Column<Product>[] = [
  {
    header: 'Name',
    cell: (p) => (
      <div className="flex items-center gap-3">
        {p?.images?.[0] ? (
          <Picture
            priority
            src={p?.images[0]}
            alt={p?.name ?? 'Product photo'}
            className="w-8 h-8 object-cover shrink-0"
          />
        ) : (
          <div className="w-8 h-8 bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark shrink-0 flex items-center justify-center">
            <span className="text-[10px] font-mono text-muted-light dark:text-muted-dark">?</span>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-mono text-text-light dark:text-text-dark">
            {p?.name ?? (
              <span className="text-muted-light dark:text-muted-dark italic">Unnamed</span>
            )}
          </p>
          {p?.description && (
            <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark truncate max-w-45">
              {p?.description}
            </p>
          )}
        </div>
      </div>
    )
  },
  {
    header: 'Price',
    className: 'whitespace-nowrap text-xs font-mono text-muted-light dark:text-muted-dark',
    cell: (p) => `$${Number(p?.price).toFixed(2)}`
  },
  {
    header: 'Shipping',
    className: 'whitespace-nowrap text-xs font-mono text-muted-light dark:text-muted-dark',
    cell: (p) => `$${Number(p?.shippingPrice ?? 0).toFixed(2)}`
  },
  {
    header: 'Quantity',
    className: 'whitespace-nowrap text-xs font-mono text-muted-light dark:text-muted-dark',
    cell: (p) => p?.countInStock
  },
  {
    header: 'Sold',
    className: 'whitespace-nowrap text-xs font-mono text-muted-light dark:text-muted-dark',
    cell: (p) => p?.sold ?? 0
  },
  {
    header: 'Status',
    className: 'whitespace-nowrap',
    cell: (p) => {
      const status = p.archivedAt ? 'Archived' : p.isLive ? 'Live' : 'Draft'
      const textColor = p.archivedAt
        ? 'text-muted-light dark:text-muted-dark'
        : p.isLive
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-amber-600 dark:text-amber-400'
      const dotColor = p.archivedAt
        ? 'bg-border-light dark:bg-border-dark'
        : p.isLive
          ? 'bg-emerald-500'
          : 'bg-amber-500'
      return (
        <span
          className={`inline-flex items-center gap-1.5 text-[9px] font-mono tracking-[0.15em] uppercase ${textColor}`}
        >
          <span className={`w-1.5 h-1.5 shrink-0 ${dotColor}`} aria-hidden="true" />
          {status}
        </span>
      )
    }
  },
  {
    header: '',
    className: 'text-right whitespace-nowrap',
    cell: (p) => (
      <Link
        href={`/admin/products/${p?.id}`}
        className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:underline"
        aria-label={`Edit ${p?.name ?? 'product'}`}
      >
        Edit →
      </Link>
    )
  }
]

export function AdminProductsClient({ products }: { products: [] }) {
  return (
    <main id="main-content" className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
      <AdminPageHeader
        title="Products"
        count={{ value: products.length, noun: 'product' }}
        action={
          <AdminHeaderButton
            href="/admin/products/new"
            icon={<Plus className="w-3 h-3" aria-hidden="true" />}
          >
            Add Product
          </AdminHeaderButton>
        }
      />

      <div className="w-full px-4 sm:px-6 py-6">
        <AdminTable
          columns={columns}
          rows={products}
          rowKey={(p) => p?.id}
          caption="Product list"
          emptyMessage={
            <span className="flex flex-col items-center gap-3">
              No products yet
              <Link
                href="/admin/products/new"
                className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark hover:text-secondary-light dark:hover:text-secondary-dark transition-colors focus:outline-none focus-visible:underline"
              >
                Add the first one →
              </Link>
            </span>
          }
        />
      </div>
    </main>
  )
}
