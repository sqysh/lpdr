'use server'

import prisma from 'prisma/client'
import { ProductCreateInputs } from 'types/_product'
import { getErrorMessage } from 'app/utils/_error.utils'
import { AdminFailure, requireAdmin } from '../../auth/requireAdmin'
import { createLog } from '../../log/createLog'

export const createProduct = async (input: ProductCreateInputs) => {
  const gate = await requireAdmin()
  if (gate.ok === false) return { success: false, error: (gate as AdminFailure).error, data: null }

  try {
    await prisma.product.create({
      data: {
        name: input.name,
        images: input.images ?? [],
        description: input.description,
        price: input.price ?? 0,
        shippingPrice: input.shippingPrice ?? 0,
        countInStock: Number(input.countInStock) || 0,
        isLive: input.isLive ?? false,
        isPhysicalProduct: input.isPhysicalProduct ?? true,
        sizes: input.sizes ?? undefined
      }
    })

    return { success: true, error: null, data: null }
  } catch (error) {
    await createLog('error', 'Failed to create product', {
      error: getErrorMessage(error),
      createdBy: gate.userId
    })
    return { success: false, error: 'Failed to create product. Please try again.', data: null }
  }
}
