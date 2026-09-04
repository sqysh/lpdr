import { z } from 'zod'

export const promoteUserToAdminSchema = z.object({
  userId: z.string().trim().min(1, 'A user is required.')
})

export const preProvisionAdminUserSchema = z.object({
  email: z.email('Enter a valid email address.').trim().toLowerCase(),
  firstName: z.string().trim().min(1, 'First name is required.').max(60),
  lastName: z.string().trim().min(1, 'Last name is required.').max(60)
})

export const revokeAdminRoleSchema = z.object({
  userId: z.string().trim().min(1, 'A user is required.')
})

export const updateUserStatusSchema = z.object({
  userId: z.string().trim().min(1, 'A user is required.'),
  isActive: z.boolean()
})

export const searchUserSchema = z.object({
  query: z.string().trim().min(2, 'Enter at least two characters.').max(100)
})

export type PromoteUserToAdminInput = z.infer<typeof promoteUserToAdminSchema>
export type PreProvisionAdminUserInput = z.infer<typeof preProvisionAdminUserSchema>
export type RevokeAdminRoleInput = z.infer<typeof revokeAdminRoleSchema>
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>
export type SearchUserInput = z.infer<typeof searchUserSchema>
