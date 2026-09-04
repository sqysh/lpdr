import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'
import { requireAdmin } from 'lib/auth/guards'
import { getErrorMessage } from 'lib/utils/error.utils'
import { serialize } from 'lib/utils/serializers.utils'

export const getProductById = async (id: string) => {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, error: gate.error, data: null }

  try {
    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) return { success: false, error: 'Product not found.', data: null }

    return { success: true, data: serialize(product), error: null }
  } catch (error) {
    await createLog('error', 'Failed to get product by id', {
      productId: id,
      error: getErrorMessage(error)
    })

    return { success: false, error: 'Failed to get product. Please try again.', data: null }
  }
}
