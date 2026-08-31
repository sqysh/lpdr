import { serializeProduct } from 'app/utils/_product.utils'
import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { AdminFailure, requireAdmin } from '../../auth/requireAdmin'
import { getErrorMessage } from 'app/utils/_error.utils'

export const getProductById = async (id: string) => {
  const gate = await requireAdmin()
  if (!gate.ok) return { success: false, error: (gate as AdminFailure).error, data: null }

  try {
    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) return { success: false, error: 'Product not found.', data: null }

    return { success: true, data: serializeProduct(product), error: null }
  } catch (error) {
    await createLog('error', 'Failed to get product by id', {
      productId: id,
      error: getErrorMessage(error)
    })

    return { success: false, error: 'Failed to get product. Please try again.', data: null }
  }
}
