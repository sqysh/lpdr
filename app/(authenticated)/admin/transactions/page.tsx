import prisma from 'prisma/client'
import { AdminTransactionsClient } from './AdminTransactionsClient'
import { serialize } from 'lib/utils/serializers.utils'
import { orderListArgs } from 'types/order.types'

export default async function AdminTransactionsPagePage() {
  const orders = await prisma.order.findMany({
    where: { source: 'SITE' },
    orderBy: { createdAt: 'desc' },
    ...orderListArgs
  })

  return <AdminTransactionsClient orders={serialize(orders)} />
}
