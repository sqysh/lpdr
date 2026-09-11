import { Prisma } from '@prisma/client'

export type IAddress = Prisma.AddressGetPayload<{
  select: {
    id: true
    updatedAt: true
    name: true
    addressLine1: true
    addressLine2: true
    city: true
    state: true
    zipPostalCode: true
    country: true
  }
}>
