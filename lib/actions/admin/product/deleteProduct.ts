'use server'

import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { AdminFailure, requireAdmin } from '../../auth/requireAdmin'
import { getErrorMessage } from 'app/utils/_error.utils'

export async function deleteProduct(productId: string) {
  const gate = await requireAdmin()
  if (!gate.ok) return { success: false, error: (gate as AdminFailure).error, data: null }

  try {
    const orderItemCount = await prisma.orderItem.count({ where: { productId } })

    if (orderItemCount > 0) {
      return {
        success: false,
        error: `This product is tied to ${orderItemCount} existing order${orderItemCount === 1 ? '' : 's'}. Archive it instead of deleting to preserve order history.`,
        data: null
      }
    }

    await prisma.product.delete({ where: { id: productId } })

    await createLog('info', 'Product deleted', {
      productId,
      deletedBy: gate.userId
    })

    return { success: true, data: null, error: null }
  } catch (error) {
    await createLog('error', 'Failed to delete product', {
      productId,
      error: getErrorMessage(error)
    })
    return { success: false, error: 'Failed to delete product. Please try again.', data: null }
  }
}
