import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, Package, Zap } from 'lucide-react'
import { FormField, Toggle } from 'components/_primitives'
import { FormErrors } from './AuctionItemForm'

type Props = {
  auctionId: string
  isActive: boolean
  isUpdating: boolean
  loading: boolean
  uploadProgress: number
  type: 'AUCTION' | 'FIXED'
  showBuyNow: boolean
  inputs: {
    name: string
    description: string
    startingPrice: string
    buyNowPrice: string
    totalQuantity: string
    requiresShipping: boolean
    shippingCosts: string
  }
  errors: FormErrors
  handleInput: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void
  patch: (data: Record<string, unknown>) => void
  onSave: () => void
}

export function AuctionItemFields({
  auctionId,
  isActive,
  isUpdating,
  loading,
  uploadProgress,
  type,
  showBuyNow,
  inputs,
  errors,
  handleInput,
  patch,
  onSave
}: Props) {
  return (
    <div className="space-y-5 min-w-0">
      {isActive && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-500/10 border border-amber-500/30">
          <Zap size={11} className="text-amber-500 shrink-0" aria-hidden="true" />
          <p className="text-[10px] font-mono text-amber-500 leading-snug">
            This auction is live — only name, description, and photos can be changed.
          </p>
        </div>
      )}

      <AnimatePresence>
        {errors.form && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="alert"
            className="px-4 py-3 border border-red-500/30 bg-red-500/10 text-red-500 text-xs font-mono"
          >
            {errors.form}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
        Basic Info
      </p>

      <FormField
        id="name"
        label="Name"
        name="name"
        value={inputs.name}
        onChange={handleInput}
        placeholder="Item name"
        error={errors.name}
        required
      />

      <FormField
        id="description"
        label="Description"
        name="description"
        type="textarea"
        value={inputs.description}
        onChange={handleInput}
        placeholder="Item description..."
        rows={3}
      />

      <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
        Pricing
      </p>

      <div className="grid grid-cols-2 gap-3">
        {type === 'AUCTION' && (
          <FormField
            id="startingPrice"
            label="Starting Price"
            name="startingPrice"
            type="number"
            value={inputs.startingPrice}
            onChange={handleInput}
            placeholder="0.00"
            error={errors.startingPrice}
            required
            className={isActive ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
          />
        )}
        {showBuyNow && (
          <FormField
            id="buyNowPrice"
            label="Buy Now Price"
            name="buyNowPrice"
            type="number"
            value={inputs.buyNowPrice}
            onChange={handleInput}
            placeholder="0.00"
            error={errors.buyNowPrice}
            required
            className={isActive ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
          />
        )}
        {showBuyNow && (
          <FormField
            id="totalQuantity"
            label="Quantity"
            name="totalQuantity"
            type="number"
            value={inputs.totalQuantity}
            onChange={handleInput}
            placeholder="1"
          />
        )}
      </div>

      <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark">
        Shipping
      </p>

      <Toggle
        id="requiresShipping"
        label="Requires Shipping"
        description="Item needs to be physically shipped"
        checked={inputs.requiresShipping}
        onToggle={() => patch({ requiresShipping: !inputs.requiresShipping })}
      />

      {inputs.requiresShipping && (
        <FormField
          id="shippingCosts"
          label="Shipping Cost ($)"
          name="shippingCosts"
          type="number"
          value={inputs.shippingCosts}
          onChange={handleInput}
          placeholder="0.00"
          className={isActive ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
        />
      )}

      {loading && uploadProgress > 0 && uploadProgress < 100 && (
        <div className="space-y-1">
          <p className="text-[10px] font-mono text-muted-light dark:text-muted-dark">
            Uploading photos... {Math.round(uploadProgress)}%
          </p>
          <div className="w-full h-1 bg-border-light dark:bg-border-dark">
            <div
              className="h-1 bg-primary-light dark:bg-primary-dark transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 pt-4">
        <button
          type="button"
          onClick={onSave}
          disabled={loading}
          aria-busy={loading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-light dark:bg-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark text-white dark:text-bg-dark text-[10px] font-mono tracking-[0.2em] uppercase transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          {loading ? (
            <>
              <Loader2 size={13} className="animate-spin" aria-hidden="true" /> Saving...
            </>
          ) : (
            <>
              <Package size={13} aria-hidden="true" /> {isUpdating ? 'Save Changes' : 'Add Item'}
            </>
          )}
        </button>
        <Link
          href={`/admin/auctions/${auctionId}?tab=items`}
          className="px-4 py-3 border border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark text-[10px] font-mono tracking-[0.2em] uppercase hover:text-text-light dark:hover:text-text-dark hover:border-primary-light/40 dark:hover:border-primary-dark/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
        >
          Cancel
        </Link>
      </div>
    </div>
  )
}
