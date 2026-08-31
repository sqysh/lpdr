import { getLiveProducts } from 'lib/actions/public/product/getLiveProducts'
import PublicMerchClient from './PublicMerchClient'

export default async function MerchPage() {
  const result = await getLiveProducts()
  return <PublicMerchClient products={result?.data} />
}
