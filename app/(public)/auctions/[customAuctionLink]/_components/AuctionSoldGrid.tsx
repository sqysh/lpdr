import { SectionLabel } from 'components/_primitives'
import { PublicAuction, PublicAuctionListItem } from 'types/auction.types'
import { AuctionItemCard } from './auction-item-card/AuctionItemCard'
import { MyBid } from 'lib/actions/public/auction/getMyBidsForAuction'

type Props = {
  sold: PublicAuctionListItem[]
  auction: PublicAuction
  customAuctionLink: string
  myBids: Record<string, MyBid>
  isAuthed: boolean
}

export function AuctionSoldGrid({ sold, auction, customAuctionLink, myBids, isAuthed }: Props) {
  if (sold.length === 0) return null

  return (
    <section aria-labelledby="sold-heading" className="mt-14 sm:mt-20">
      <div className="mb-5 space-y-1.5">
        <SectionLabel muted>Sold</SectionLabel>
        <h2 id="sold-heading" className="font-quicksand font-black text-xl xs:text-2xl text-text-light dark:text-text-dark">
          {sold.length} Item{sold.length !== 1 ? 's' : ''} Sold
        </h2>
      </div>
      <ul
        role="list"
        className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px items-stretch bg-border-light dark:bg-border-dark border border-border-light dark:border-border-dark"
      >
        {sold.map((item, i) => (
          <li key={item.id} id={`item-${item.id}`} className="bg-bg-light dark:bg-bg-dark scroll-mt-28">
            <AuctionItemCard
              item={item}
              auctionStatus={auction.status}
              index={i}
              customAuctionLink={customAuctionLink}
              myBid={myBids[item.id] ?? null}
              isAuthed={isAuthed}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
