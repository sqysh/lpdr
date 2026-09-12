import { z } from 'zod'

const requiredString = (label: string) => z.string().trim().min(1, `${label} is required`)

/** Applicant details collected before payment or a bypass code. */
export const preAppDetailsFields = {
  firstName: requiredString('First name').max(60),
  lastName: requiredString('Last name').max(60)
}

export const preAppDetailsSchema = z.object(preAppDetailsFields)

/** Details plus the code. The code is only checked for shape here; whether it
 *  is valid and unclaimed is decided server-side. */
export const redeemBypassCodeSchema = z.object({
  ...preAppDetailsFields,
  bypassCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^DOXIE-[A-HJ-NP-Z2-9]{8}$/, 'That code is not valid.')
})

export type PreAppDetailsInput = z.input<typeof preAppDetailsSchema>
export type PreAppDetailsValues = z.output<typeof preAppDetailsSchema>
export type RedeemBypassCodeInput = z.input<typeof redeemBypassCodeSchema>
export type RedeemBypassCodeValues = z.output<typeof redeemBypassCodeSchema>

export const EMPTY_PRE_APP_DETAILS: PreAppDetailsInput = {
  firstName: '',
  lastName: ''
}
