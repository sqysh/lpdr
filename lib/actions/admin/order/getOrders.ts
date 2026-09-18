'use server'

import prisma from 'prisma/client'
import { requireAdmin } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import { orderListArgs, type IOrderRow } from 'types/order.types'
import type { ActionResult } from 'types/action.types'
import { Prisma } from '@prisma/client'
import { serialize } from 'lib/utils/serializers.utils'
import { createLog } from 'lib/actions/log/createLog'

export const getOrders = async (where?: Prisma.OrderWhereInput): Promise<ActionResult<IOrderRow[]>> => {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, data: null, error: gate.error }

  try {
    const orders = await prisma.order.findMany({
      ...orderListArgs,
      where,
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, data: serialize(orders) }
  } catch (error) {
    await createLog('error', 'Failed to load orders', {
      loadedBy: gate.userId,
      error: getErrorMessage(error)
    })

    return { success: false, data: null, error: 'Failed to load orders' }
  }
}
