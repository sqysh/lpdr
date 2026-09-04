import { getUserAddress } from 'lib/actions/my-pack/getUserAddress'
import { getUserName } from 'lib/actions/my-pack/getUserName'
import PublicAuctionInstantBuyClient from './PublicAuctionInstantBuyClient'
import { getSavedPaymentMethods } from 'lib/actions/_stripe/getSavedPaymentMethods'
import { auth } from 'lib/auth'
import { getPublicAuctionItemById } from 'lib/actions/public/auction/getPublicAuctionItemById'
import { notFound } from 'next/navigation'

export default async function PublicAuctionInstantBuyPage({ params }: { params: Promise<{ auctionItemId: string }> }) {
  const { auctionItemId } = await params
  const session = await auth()
  const isAuthed = !!session?.user?.id

  const [itemResult, cardsResult, userNameResult, userAddressResult] = await Promise.all([
    getPublicAuctionItemById(auctionItemId).catch(() => ({ data: null })),
    isAuthed
      ? getSavedPaymentMethods().catch(() => ({ success: false, data: [] }))
      : Promise.resolve({ success: true, data: [] }),
    isAuthed ? getUserName().catch(() => ({ success: false, data: null })) : Promise.resolve({ success: true, data: null }),
    isAuthed ? getUserAddress().catch(() => ({ success: false, data: null })) : Promise.resolve({ success: true, data: null })
  ])

  const auctionItem = itemResult.data

  if (!auctionItem) notFound()
  if (auctionItem.auction.status !== 'ACTIVE') notFound()
  if (auctionItem.sellingFormat !== 'FIXED') notFound()

  return (
    <PublicAuctionInstantBuyClient
      auctionItem={auctionItem}
      savedCards={cardsResult.success ? (cardsResult.data ?? []) : []}
      isAuthed={isAuthed}
      userEmail={session?.user?.email ?? null}
      userName={userNameResult.data}
      userAddress={userAddressResult.data}
    />
  )
}
