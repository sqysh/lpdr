'use server'

import prisma from 'prisma/client'
import { ProductUpdateInputs } from 'types/_product'
import { getErrorMessage } from 'app/utils/_error.utils'
import { AdminFailure, requireAdmin } from '../../auth/requireAdmin'
import { createLog } from '../../log/createLog'

export const updateProduct = async (input: ProductUpdateInputs) => {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, error: (gate as AdminFailure).error, data: null }

  try {
    await prisma.product.update({
      where: { id: input.id },
      data: {
        ...(input.name != null && { name: input.name }),
        ...(input.images != null && { images: input.images }),
        ...(input.description != null && { description: input.description }),
        ...(input.price != null && { price: input.price }),
        ...(input.shippingPrice != null && { shippingPrice: input.shippingPrice }),
        ...(input.countInStock != null && { countInStock: input.countInStock }),
        ...(input.sizes !== undefined && { sizes: input.sizes }),
        ...(input.isLive != null && { isLive: input.isLive }),
        ...(input.isPhysicalProduct != null && { isPhysicalProduct: input.isPhysicalProduct })
      }
    })

    return { success: true, error: null, data: null }
  } catch (error) {
    await createLog('error', 'Failed to update product', {
      error: getErrorMessage(error),
      createdBy: gate.userId
    })

    return {
      success: false,
      error: 'Failed to update product. Please try again.',
      data: null
    }
  }
}
