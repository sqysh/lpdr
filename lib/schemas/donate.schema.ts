import { z } from 'zod'

export const donateSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(60),
  lastName: z.string().trim().min(1, 'Last name is required').max(60)
})

export type DonateFormInput = z.input<typeof donateSchema>
export type DonateFormValues = z.output<typeof donateSchema>
