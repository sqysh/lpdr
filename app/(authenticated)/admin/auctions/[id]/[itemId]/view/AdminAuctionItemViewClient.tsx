'use client'

import {
  Gavel,
  ShoppingBag,
  TrendingUp,
  Clock,
  Edit2,
  LayoutDashboard,
  Lock,
  Tag,
  Truck
} from 'lucide-react'
import { formatMoney } from 'lib/utils/currency.utils'
import Link from 'next/link'
import { getItemStatusConfig } from 'lib/utils/auction.utils'
import { PhotoGallery } from 'app/(authenticated)/admin/auctions/[id]/[itemId]/_components/PhotoGallery'
import { AuctionItemStatus, AuctionStatus } from '@prisma/client'
import { IAuctionBid } from 'types/auction-bid'
import { IAuctionItemPhoto } from 'types/auction-item-photo'
import { StatCard } from './_components/StatCard'
import { BidsTable } from './_components/BidsTable'

export default function AdminAuctionItemViewClient({
  auctionItem
}: {
  auctionItem: {
    status: AuctionItemStatus
    auction: { status: AuctionStatus }
    bids: IAuctionBid[]
    sellingFormat: string
    isAuction: boolean
    currentBid: number | null
    minimumBid: number | null
    soldPrice: number | null
    shippingCosts: number | null
    startingPrice: number | null
    buyNowPrice: number | null
    totalQuantity: number | null
    description: string | null
    requiresShipping: boolean
    totalBids: number
    auctionId: string
    name: string
    id: string
    photos: IAuctionItemPhoto[]
  }
}) {
  const item = auctionItem

  const statusConfig = getItemStatusConfig(item.status)
  const isActive = item.auction?.status === 'ACTIVE'
  const highBid = item.bids?.length ? Math.max(...item.bids.map((b) => b.bidAmount)) : null

  const detailRows = [
    { label: 'Format', value: item.sellingFormat.toLowerCase() },
    ...(item.isAuction
      ? [
          { label: 'Current Bid', value: formatMoney(item.currentBid) },
          { label: 'Minimum Bid', value: formatMoney(item.minimumBid) }
        ]
      : [{ label: 'Quantity', value: item.totalQuantity ? String(item.totalQuantity) : '—' }]),
    ...(item.status === 'SOLD'
      ? [{ label: 'Sold Price', value: formatMoney(item.soldPrice) }]
      : []),
    { label: 'Requires Shipping', value: item.requiresShipping ? 'Yes' : 'No' },
    ...(item.requiresShipping
      ? [
          {
            label: 'Shipping Cost',
            value: item.shippingCosts != null ? formatMoney(item.shippingCosts) : 'TBD'
          }
        ]
      : [])
  ]

  const auctionEnded = item.auction?.status === 'ENDED'

  const stats = [
    {
      label: 'Total Bids',
      value: String(item.totalBids),
      icon: Gavel,
      iconColor: 'text-primary-light dark:text-primary-dark'
    },
    {
      label: 'High Bid',
      value: formatMoney(highBid),
      icon: TrendingUp,
      iconColor: 'text-emerald-500'
    },
    item.isAuction
      ? {
          label: 'Starting',
          value: formatMoney(item.startingPrice),
          icon: Clock,
          iconColor: 'text-amber-500'
        }
      : {
          label: 'Buy Now',
          value: formatMoney(item.buyNowPrice),
          icon: ShoppingBag,
          iconColor: 'text-violet-500'
        },
    auctionEnded
      ? { label: 'Status', value: item.status.toLowerCase(), icon: Tag, iconColor: 'text-pink-500' }
      : {
          label: 'Shipping',
          value: item.requiresShipping
            ? item.shippingCosts != null
              ? formatMoney(item.shippingCosts)
              : 'TBD'
            : 'None',
          icon: Truck,
          iconColor: 'text-pink-500'
        }
  ]

  return (
    <main id="main-content" className="min-h-screen w-full bg-bg-light dark:bg-bg-dark">
      {/* ── Topbar ── */}
      <header className="sticky top-0 z-10 w-full border-b border-border-light dark:border-border-dark bg-bg-light/90 dark:bg-bg-dark/90 backdrop-blur px-4 h-10 flex items-center justify-between gap-3">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 min-w-0">
          <Link
            href="/admin/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            <LayoutDashboard className="w-3 h-3" aria-hidden="true" />
            Dashboard
          </Link>
          <span
            className="hidden sm:inline text-[9px] font-mono text-border-light dark:text-border-dark"
            aria-hidden="true"
          >
            /
          </span>
          <Link
            href="/admin/auctions"
            className="hidden sm:inline text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark"
          >
            Auctions
          </Link>
          <span
            className="hidden sm:inline text-[9px] font-mono text-border-light dark:text-border-dark"
            aria-hidden="true"
          >
            /
          </span>
          <Link
            href={`/admin/auctions/${item.auctionId}?tab=items&type=${item.sellingFormat}`}
            className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark shrink-0"
          >
            Auction Items
          </Link>
          <span
            className="text-[9px] font-mono text-border-light dark:text-border-dark"
            aria-hidden="true"
          >
            /
          </span>
          <h1
            className="text-[9px] font-mono tracking-[0.15em] uppercase text-text-light dark:text-text-dark truncate"
            aria-current="page"
          >
            {item.name}
          </h1>
        </nav>

        {isActive && (
          <span className="shrink-0 flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-[8px] font-mono tracking-[0.15em] uppercase text-amber-500 font-black">
            <Lock size={9} aria-hidden="true" />
            <span className="hidden sm:inline">Limited Editing</span>
          </span>
        )}
      </header>

      <div className="w-full px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* ── Title band ── */}
          <div className="flex items-start justify-between gap-3 flex-wrap pt-6 pb-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                <span
                  className="block w-4 h-px bg-primary-light dark:bg-primary-dark shrink-0"
                  aria-hidden="true"
                />
                <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary-light dark:text-primary-dark">
                  Auction Item
                </p>
                <span
                  className={`text-[9px] font-black tracking-widest uppercase px-2 py-0.5 border ${statusConfig.classes}`}
                >
                  {statusConfig.label}
                </span>
                {isActive && (
                  <span className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-500">
                    <span className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" aria-hidden="true" />
                    Live
                  </span>
                )}
              </div>
              <h2 className="font-quicksand font-black text-xl sm:text-3xl text-text-light dark:text-text-dark wrap-break-word">
                {item.name}
              </h2>
            </div>

            <Link
              href={auctionEnded ? '#' : `/admin/auctions/${item.auctionId}/${item.id}/edit`}
              aria-disabled={auctionEnded}
              onClick={auctionEnded ? (e) => e.preventDefault() : undefined}
              className={`flex items-center gap-2 px-3.5 py-2 border text-[10px] font-mono tracking-[0.2em] uppercase transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-light dark:focus-visible:ring-primary-dark ${
                auctionEnded
                  ? 'border-border-light dark:border-border-dark text-muted-light/30 dark:text-muted-dark/30 cursor-not-allowed'
                  : 'border-border-light dark:border-border-dark text-muted-light dark:text-muted-dark hover:text-primary-light dark:hover:text-primary-dark hover:border-primary-light/40 dark:hover:border-primary-dark/40'
              }`}
            >
              <Edit2 size={12} aria-hidden="true" />
              Edit Item
            </Link>
          </div>

          {/* ── Main grid ── */}
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-6 xl:gap-8 items-start pb-6">
            {/* Left — gallery */}
            <div className="min-w-0">
              <PhotoGallery photos={item.photos} />
            </div>

            {/* Right — details */}
            <div className="space-y-5 min-w-0">
              {/* Stats strip */}
              <div className="grid grid-cols-2 gap-px bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark">
                {stats.map((stat, i) => (
                  <StatCard key={stat.label} {...stat} delay={i * 0.06} />
                ))}
              </div>

              {/* Description */}
              {item.description && (
                <section
                  aria-labelledby="item-description"
                  className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
                >
                  <div className="px-4 py-2.5 border-b border-border-light dark:border-border-dark">
                    <h3
                      id="item-description"
                      className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark"
                    >
                      Description
                    </h3>
                  </div>
                  <p className="px-4 py-3 text-xs font-mono text-muted-light dark:text-muted-dark leading-relaxed wrap-break-word">
                    {item.description}
                  </p>
                </section>
              )}

              {/* Details */}
              <section
                aria-labelledby="item-details"
                className="border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark"
              >
                <div className="px-4 py-2.5 border-b border-border-light dark:border-border-dark">
                  <h3
                    id="item-details"
                    className="text-[9px] font-mono tracking-[0.2em] uppercase text-muted-light dark:text-muted-dark"
                  >
                    Details
                  </h3>
                </div>
                <dl className="divide-y divide-border-light dark:divide-border-dark">
                  {detailRows.map(({ label, value }) => (
                    <div key={label} className="grid grid-cols-[45%_1fr] gap-2 px-4 py-2.5">
                      <dt className="text-[9px] font-mono tracking-[0.15em] uppercase text-muted-light dark:text-muted-dark self-center">
                        {label}
                      </dt>
                      <dd className="text-xs font-mono tabular-nums text-text-light dark:text-text-dark capitalize">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>
          </div>

          {/* ── Bid history ── */}
          {item.isAuction && (
            <div className="pb-6">
              <BidsTable bids={item.bids ?? []} />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
