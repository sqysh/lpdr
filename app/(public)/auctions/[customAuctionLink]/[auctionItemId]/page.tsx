import PublicAuctionItemClient from './PublicAuctionItemClient'
import { notFound } from 'next/navigation'
import { getPublicAuctionItemById } from 'lib/actions/public/auction/getPublicAuctionItemById'
import { auth } from 'lib/auth'

export default async function PublicAuctionItemPage({ params }: { params: Promise<{ auctionItemId: string }> }) {
  const { auctionItemId } = await params
  const [auctionItemResult, session] = await Promise.all([getPublicAuctionItemById(auctionItemId), auth()])

  if (!auctionItemResult.success || !auctionItemResult.data) notFound()

  return (
    <PublicAuctionItemClient
      item={auctionItemResult.data}
      auctionItems={auctionItemResult.data.auction.items}
      isAuthed={!!session?.user?.id}
      currentUserId={session?.user?.id ?? null}
    />
  )
}
