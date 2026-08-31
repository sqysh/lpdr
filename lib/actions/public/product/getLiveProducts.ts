import { serializeProduct } from 'app/utils/_product.utils'
import prisma from 'prisma/client'
import { createLog } from '../../log/createLog'

export const getLiveProducts = async () => {
  try {
    const products = await prisma.product.findMany({
      where: { isLive: true },
      orderBy: { createdAt: 'desc' }
    })

    return {
      success: true,
      data: products.map(serializeProduct),
      error: null
    }
  } catch (error) {
    await createLog('error', 'Failed to get live products', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return {
      success: false,
      error: 'Failed to get live products. Please try again.',
      data: null
    }
  }
}
