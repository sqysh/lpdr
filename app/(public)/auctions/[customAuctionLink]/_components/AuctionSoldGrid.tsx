import { SectionLabel } from 'app/components/_primitives'
import { IAuction } from 'types/_auction'
import { IAuctionItemLive } from 'types/_auction-item'
import { AuctionItemCard } from './AuctionItemCard'

export function AuctionSoldGrid({
  sold,
  auction,
  customAuctionLink
}: {
  sold: IAuctionItemLive[]
  auction: IAuction
  customAuctionLink: string
}) {
  if (sold.length === 0) return null

  return (
    <section aria-labelledby="sold-heading">
      <div className="mb-6">
        <SectionLabel muted>Sold</SectionLabel>
        <h2
          id="sold-heading"
          className="font-quicksand font-black text-xl xs:text-2xl text-text-light dark:text-text-dark mt-1"
        >
          {sold.length} Item{sold.length !== 1 ? 's' : ''} Sold
        </h2>
      </div>
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-px items-stretch bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark">
        {sold.map((item, i) => (
          <div key={item.id} className="bg-bg-light dark:bg-bg-dark">
            <AuctionItemCard
              item={item}
              auctionStatus={auction.status}
              index={i}
              customAuctionLink={customAuctionLink}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
