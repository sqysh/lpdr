'use server'

import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { AdminFailure, requireAdmin } from '../../auth/requireAdmin'
import { getErrorMessage } from 'app/utils/_error.utils'

export default async function getProducts() {
  const gate = await requireAdmin()
  if (!gate.ok) return { success: false, error: (gate as AdminFailure).error, data: null }

  try {
    const [products, orderItems] = await Promise.all([
      prisma.product.findMany({
        where: { archivedAt: null },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.orderItem.findMany({
        where: {
          isPhysical: true,
          productId: { not: null },
          order: { status: 'CONFIRMED' }
        },
        select: { productId: true, quantity: true }
      })
    ])

    const soldMap = orderItems.reduce<Record<string, number>>((acc, item) => {
      if (!item.productId) return acc
      acc[item.productId] = (acc[item.productId] ?? 0) + (item.quantity ?? 1)
      return acc
    }, {})

    return {
      success: true,
      error: null,
      data: products.map((p) => ({
        ...p,
        price: Number(p.price),
        shippingPrice: Number(p.shippingPrice),
        archivedAt: p.archivedAt?.toISOString() ?? null,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        sold: soldMap[p.id] ?? 0
      }))
    }
  } catch (error) {
    await createLog('error', 'Failed to get products', {
      error: getErrorMessage(error)
    })

    return { success: false, error: 'Failed to get products. Please try again.', data: null }
  }
}
