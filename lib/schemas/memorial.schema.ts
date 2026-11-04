import { z } from 'zod'

// The message limit is an admin setting, so the schema is built per form. 500 is the ceiling either way,
// because it all travels in one Stripe metadata value
export const memorialFormSchema = (messageMaxLength: number) =>
  z.object({
    firstName: z.string().trim().min(1, 'Please enter your first name').max(50),
    lastName: z.string().trim().min(1, 'Please enter your last name').max(50),
    dogName: z.string().trim().min(1, "Please enter your dog's name").max(60, 'Please keep the name under 60 characters'),
    message: z
      .string()
      .trim()
      .max(Math.min(messageMaxLength, 500), `Please keep your message under ${Math.min(messageMaxLength, 500)} characters`)
      .optional(),
    donorDisplayName: z.string().trim().max(80, 'Please keep this under 80 characters').optional(),
    showDonorName: z.boolean()
  })

type MemorialFormSchema = ReturnType<typeof memorialFormSchema>
export type MemorialFormInput = z.input<MemorialFormSchema>
export type MemorialFormValues = z.output<MemorialFormSchema>
