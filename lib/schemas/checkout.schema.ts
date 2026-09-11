import { z } from 'zod'

const requiredString = (label: string) => z.string().trim().min(1, `${label} is required`)

/** Step 2. Email comes from the session, so it is not collected here. */
export const checkoutNameFields = {
  firstName: requiredString('First name').max(60),
  lastName: requiredString('Last name').max(60)
}

/**
 * Step 3, only reached when the cart has a physical item. Defaults to empty
 * rather than required, since the schema cannot see whether shipping applies
 * or whether a saved address is in use. The component enforces that.
 */
export const checkoutAddressFields = {
  addressLine1: z.string().trim().max(120).default(''),
  addressLine2: z.string().trim().max(120).default(''),
  city: z.string().trim().max(60).default(''),
  state: z.string().trim().max(2).default(''),
  zipPostalCode: z.string().trim().max(10).default('')
}

export const checkoutSchema = z.object({
  ...checkoutNameFields,
  ...checkoutAddressFields,
  useSavedAddress: z.boolean().default(false)
})

export type CheckoutFormInput = z.input<typeof checkoutSchema>
export type CheckoutFormValues = z.output<typeof checkoutSchema>
