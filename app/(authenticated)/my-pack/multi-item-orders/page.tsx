import { getMultiItemOrders } from 'lib/actions/my-pack/getMultiItemOrders'
import MultiItemOrdersClient from './MultiItemOrdersClient'

export default async function MultiItemOrdersPage() {
  const result = await getMultiItemOrders()
  return <MultiItemOrdersClient orders={result?.data} />
}
