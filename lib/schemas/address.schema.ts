import { z } from 'zod'

export const addressSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  addressLine1: z.string().trim().min(1, 'Street address is required').max(120),
  addressLine2: z.string().trim().max(120).nullable().default(null),
  city: z.string().trim().min(1, 'City is required').max(60),
  state: z.string().trim().length(2, 'Select a state'),
  zipPostalCode: z.string().trim().min(5, 'ZIP code is required').max(10),
  country: z.string().trim().length(2).default('US')
})

export type UpdateAddressInput = z.input<typeof addressSchema>
export type UpdateAddressValues = z.output<typeof addressSchema>
