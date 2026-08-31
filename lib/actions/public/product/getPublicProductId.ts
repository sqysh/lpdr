import { serializeProduct } from 'app/utils/_product.utils'
import prisma from 'prisma/client'

export const getPublicProductById = async (id: string) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id, isLive: true }
    })

    if (!product) return { success: false, error: 'Product not found.', data: null }

    return { success: true, data: serializeProduct(product), error: null }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to get product. Please try again.',
      data: null
    }
  }
}
