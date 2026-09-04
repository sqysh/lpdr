'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Package, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { IProduct } from 'types/product'
import { FormState } from './productForm.utils'
import { ProductIdentitySection } from './ProductIdentitySection'
import { ProductPricingSection } from './ProductPricingSection'
import { ProductSizesSection } from './ProductSizesSection'
import { ProductImagesSection } from './ProductImagesSection'
import { ProductSettingsSection } from './ProductSettingsSection'
import { ProductSummarySection } from './ProductSummarySection'
import { updateProduct } from 'lib/actions/admin/product/updateProduct'
import { createProduct } from 'lib/actions/admin/product/createProduct'
import { ProductDangerSection } from './ProductDangerSection'

export default function ProductForm({ product }: { product?: IProduct }) {
  const router = useRouter()
  const isEditing = !!product
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState<FormState>({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price?.toString() ?? '',
    shippingPrice: product?.shippingPrice?.toString() ?? '',
    countInStock: product?.countInStock?.toString() ?? '',
    sizes: product?.sizes ?? [],
    isPhysicalProduct: product?.isPhysicalProduct ?? true,
    isLive: product?.isLive ?? false,
    images: product?.images ?? []
  })

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const hasSizes = form.sizes.length > 0
  const sizesTotal = form.sizes.reduce((sum, s) => sum + (s.quantity || 0), 0)
  const countInStock = hasSizes ? sizesTotal : parseInt(form.countInStock) || 0

  const handleSubmit = async () => {
    if (!form.name.trim()) return
    setLoading(true)

    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price) || 0,
      shippingPrice: parseFloat(form.shippingPrice) || 0,
      countInStock,
      sizes: form.sizes.length > 0 ? form.sizes : null,
      isPhysicalProduct: form.isPhysicalProduct,
      isLive: form.isLive,
      images: form.images
    }

    const res = isEditing
      ? await updateProduct({ id: product.id, ...payload })
      : await createProduct(payload)

    setLoading(false)
    if (res.success) router.push('/admin/products')
  }

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark">
      {/* ── Top bar ── */}
      <div className="h-16.25 px-5 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark flex items-center justify-between gap-3 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors"
            aria-label="Back to products"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="w-px h-4 bg-border-light dark:bg-border-dark" aria-hidden="true" />
          <Package
            className="w-3.5 h-3.5 text-primary-light dark:text-primary-dark"
            aria-hidden="true"
          />
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
            {isEditing ? 'Edit Product' : 'New Product'}
          </span>
        </div>

        <motion.button
          onClick={handleSubmit}
          disabled={loading || !form.name.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-mono tracking-[0.2em] uppercase bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="w-3.5 h-3.5" aria-hidden="true" />
          )}
          {loading ? 'Saving...' : 'Save Product'}
        </motion.button>
      </div>

      {/* ── Body ── */}
      <div className="max-w-4xl mx-auto px-5 py-8 grid grid-cols-1 1000:grid-cols-12 gap-6">
        <div className="1000:col-span-8 flex flex-col gap-6">
          <ProductIdentitySection form={form} set={set} />
          <ProductPricingSection
            form={form}
            set={set}
            sizesTotal={sizesTotal}
            hasSizes={hasSizes}
          />
          <ProductSizesSection form={form} set={set} />
          <ProductImagesSection form={form} set={set} />
        </div>
        <div className="1000:col-span-4 flex flex-col gap-6">
          <ProductSettingsSection form={form} set={set} />
          <ProductSummarySection form={form} countInStock={countInStock} />
          <ProductDangerSection productId={product?.id ?? null} productName={form.name ?? ''} />
        </div>
      </div>
    </div>
  )
}
