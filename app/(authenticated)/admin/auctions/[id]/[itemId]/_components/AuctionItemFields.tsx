import type { ReactNode } from 'react'
import Link from 'next/link'
import { Control, useController } from 'react-hook-form'
import { Loader2, Lock, Package, Pencil, Zap } from 'lucide-react'
import { ControlledField, Toggle } from 'components/_primitives'
import { StatusMessage, type Status } from 'components/_primitives/StatusMessage'
import type { CreateAuctionItemFormValues } from 'lib/schemas/auction.schema'
import type { SellingFormat } from 'types/auction.types'

const LIVE_NOTICE_ID = 'auction-live-notice'

type FieldAccess = 'locked' | 'editable' | 'none'

type Props = {
  auctionId: string
  control: Control<CreateAuctionItemFormValues>
  status: Status | null
  isActive: boolean
  isUpdating: boolean
  isSubmitting: boolean
  uploadProgress: number
  type: SellingFormat
  showBuyNow: boolean
}

function AccessTag({ access }: { access: Exclude<FieldAccess, 'none'> }) {
  const locked = access === 'locked'
  const Icon = locked ? Lock : Pencil

  return (
    <span className={`tag ${locked ? 'text-amber-500' : 'text-primary-light dark:text-primary-dark'}`}>
      <Icon size={9} aria-hidden="true" />
      {locked ? 'Locked while live' : 'You can change these'}
    </span>
  )
}

/**
 * A disabled <fieldset> switches off every control inside it, so the lock holds even for a
 * field that doesn't take a `disabled` prop of its own. The old approach dimmed the inputs and
 * killed pointer events, which left them reachable by keyboard and still submitted their values.
 */
function FieldGroup({ title, access, children }: { title: string; access: FieldAccess; children: ReactNode }) {
  const locked = access === 'locked'

  return (
    <fieldset disabled={locked} aria-describedby={locked ? LIVE_NOTICE_ID : undefined} className="field-group">
      <legend className="flex flex-wrap items-center gap-x-3 gap-y-1 w-full mb-3">
        <span className="eyebrow">{title}</span>
        {access !== 'none' && <AccessTag access={access} />}
      </legend>
      <div className={`field-stack ${locked ? 'opacity-45 cursor-not-allowed' : ''}`}>{children}</div>
    </fieldset>
  )
}

export function AuctionItemFields(props: Props) {
  const { auctionId, control, status, isActive, isUpdating, isSubmitting, uploadProgress, type, showBuyNow } = props

  const { field: requiresShipping } = useController({ control, name: 'requiresShipping' })

  // New items can be added while bidding is open. It is the items already taking bids that lock,
  // so a brand new item on a live auction is fully editable right up until it is saved.
  const isLocked = isActive && isUpdating

  return (
    <div className="flex flex-col gap-6 min-w-0">
      {isActive && (
        <div id={LIVE_NOTICE_ID} className="notice notice-warning">
          <Zap size={11} className="text-amber-500 shrink-0 mt-0.75" aria-hidden="true" />
          <div className="flex flex-col gap-1.5">
            <p className="text-f10 font-mono leading-relaxed">Bidding is open on this auction.</p>
            <p className="text-f10 font-mono opacity-80 leading-relaxed">
              {isLocked
                ? 'You can still change the name, description and photos. Price, quantity and shipping stay locked until the auction ends, so nobody is bidding on different terms than the ones they started with.'
                : 'This item goes up for bidding the moment you save it, so check the price and quantity first. They lock once it is live.'}
            </p>
          </div>
        </div>
      )}

      <StatusMessage status={status} />

      {/* Groups sit further apart than the fields inside them, so the locked/editable split reads first. */}
      <div className="flex flex-col gap-8 min-w-0">
        <FieldGroup title="Basic Info" access={isLocked ? 'editable' : 'none'}>
          <ControlledField control={control} name="name" label="Name" placeholder="Item name" required />
          <ControlledField
            control={control}
            name="description"
            label="Description"
            type="textarea"
            placeholder="Item description..."
            rows={3}
          />
        </FieldGroup>

        <FieldGroup title="Pricing" access={isLocked ? 'locked' : 'none'}>
          <div className="grid grid-cols-2 gap-x-3 gap-y-5">
            {type === 'AUCTION' && (
              <ControlledField control={control} name="startingPrice" label="Starting Price" type="number" placeholder="0.00" required />
            )}
            {showBuyNow && (
              <ControlledField control={control} name="buyNowPrice" label="Buy Now Price" type="number" placeholder="0.00" required />
            )}
            {showBuyNow && <ControlledField control={control} name="totalQuantity" label="Quantity" type="number" placeholder="1" />}
          </div>
        </FieldGroup>

        <FieldGroup title="Shipping" access={isLocked ? 'locked' : 'none'}>
          <Toggle
            id="requiresShipping"
            label="Requires Shipping"
            description="Item needs to be physically shipped"
            checked={requiresShipping.value}
            onToggle={() => requiresShipping.onChange(!requiresShipping.value)}
          />

          {requiresShipping.value && (
            <ControlledField control={control} name="shippingCosts" label="Shipping Cost ($)" type="number" placeholder="0.00" />
          )}
        </FieldGroup>
      </div>

      {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
        <div className="flex flex-col gap-1.5">
          <p className="meta">Uploading photos... {Math.round(uploadProgress)}%</p>
          <div className="w-full h-1 bg-border-light dark:bg-border-dark">
            <div
              className="h-1 bg-primary-light dark:bg-primary-dark transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2 mt-2 border-t hairline">
        <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="btn-primary flex-1 mt-2">
          {isSubmitting ? (
            <>
              <Loader2 size={13} className="animate-spin" aria-hidden="true" /> Saving...
            </>
          ) : (
            <>
              <Package size={13} aria-hidden="true" /> {isUpdating ? 'Save Changes' : 'Add Item'}
            </>
          )}
        </button>
        <Link href={`/admin/auctions/${auctionId}?tab=items`} className="btn-ghost mt-2">
          Cancel
        </Link>
      </div>
    </div>
  )
}
