'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react'
import { deleteProduct } from 'lib/actions/admin/product/deleteProduct'

type Props = {
  productId: string
  productName: string
}

export function ProductDangerSection({ productId, productName }: Props) {
  const router = useRouter()
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setLoading(true)
    setError(null)

    const result = await deleteProduct(productId)

    setLoading(false)

    if (result.success) {
      router.push('/admin/products')
    } else {
      setError(result.error ?? 'Something went wrong.')
      setConfirm(false)
    }
  }

  return (
    <section className="border border-red-500/20 bg-red-500/5">
      <div className="px-4 py-3 border-b border-red-500/20">
        <div className="flex items-center gap-2">
          <span className="block w-3 h-px bg-red-500 shrink-0" aria-hidden="true" />
          <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-red-500">
            Danger Zone
          </p>
        </div>
      </div>
      <div className="px-4 py-4 space-y-3">
        <p className="text-xs font-semibold text-text-light dark:text-text-dark">
          Delete this product
        </p>
        <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark leading-relaxed">
          Permanently removes {productName || 'this product'} from the store. This cannot be undone.
          Products with existing order history cannot be deleted — archive them instead.
        </p>

        {error && (
          <p role="alert" className="font-mono text-[11px] text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        {!confirm ? (
          <button
            type="button"
            onClick={() => setConfirm(true)}
            className="w-full py-2.5 text-[10px] font-mono tracking-[0.2em] uppercase border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <span className="flex items-center justify-center gap-2">
              <Trash2 size={12} aria-hidden="true" /> Delete Product
            </span>
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-2.5 border border-amber-500/30 bg-amber-500/5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
              <p className="text-[10px] font-mono text-amber-600 dark:text-amber-400 leading-snug">
                Are you sure? This will permanently delete this product.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="w-full py-2.5 text-[10px] font-mono tracking-[0.2em] uppercase bg-red-500 text-white hover:bg-red-600 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={12} className="animate-spin" aria-hidden="true" /> Deleting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Trash2 size={12} aria-hidden="true" /> Confirm Delete
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setConfirm(false)}
              className="w-full py-2 text-[10px] font-mono text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
