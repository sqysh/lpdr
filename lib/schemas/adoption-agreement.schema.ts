import { z } from 'zod'
import { AdoptionPaymentMethod } from '@prisma/client'
import { MONEY_PATTERN, ZIP_PATTERN } from 'lib/constants/regex.constants'

// ── Field helpers ─────────────────────────────────────────────────────────

const requiredText = (label: string, max = 100) => z.string().trim().min(1, `${label} is required`).max(max, `${label} is too long`)

/** Empty input is stored as null rather than an empty string. */
const optionalText = (max = 500) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || null)

/** Date inputs give YYYY-MM-DD. Pinned to noon so the date can't shift a day across time zones. */
const optionalDate = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || !Number.isNaN(new Date(`${v}T12:00:00`).getTime()), 'Enter a valid date')
  .transform((v) => (v ? new Date(`${v}T12:00:00`) : null))

/** Text in the form so it can be left empty; a number in dollars once parsed. */
const optionalMoney = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || MONEY_PATTERN.test(v), 'Enter an amount like 45 or 45.50')
  .transform((v) => (v ? Number(v) : null))

const signature = (label: string) => requiredText(label, 120).min(2, 'Type your full name to sign')

/** A plain boolean, since checkboxes start unchecked, where only true passes. */
const mustAgree = (message: string) => z.boolean().refine((v) => v, message)

/** The agreement's updatedAt when the page loaded. Signing is refused if it has changed since. */
const loadedAt = z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Reload the agreement and try again')

// ── Admin: preparing ──────────────────────────────────────────────────────

/** Only the dog's id is taken; its name, age, photo and fee are read from RescueGroups on the server. */
export const prepareAdoptionAgreementSchema = z.object({
  userId: z.string().min(1, 'Choose the adopter'),
  dogRescueGroupsId: z.string().min(1, 'Choose the dog'),
  dogColorMarkings: optionalText(200),

  microchipNumber: optionalText(50),
  microchipManufacturer: optionalText(100),
  microchipRegistration: optionalText(1000),

  rabiesDate: optionalDate,
  rabiesDuration: optionalText(50),
  bordetellaDate: optionalDate,
  bordetellaDuration: optionalText(50),
  distemperDate: optionalDate,
  spayNeuterDate: optionalDate,
  heartwormTest: optionalText(200),
  fecalTest: optionalText(200),
  heartwormPreventionDate: optionalDate,
  fleaTickPreventionDate: optionalDate,
  knownIssues: optionalText(2000),

  healthCertificateFee: optionalMoney,
  paymentMethod: z.enum(AdoptionPaymentMethod)
})

export type PrepareAdoptionAgreementInput = z.input<typeof prepareAdoptionAgreementSchema>
export type PrepareAdoptionAgreementValues = z.output<typeof prepareAdoptionAgreementSchema>

/** The adopter and dog can't change after drafting; a different one is a new agreement. */
export const updateAdoptionAgreementSchema = prepareAdoptionAgreementSchema.omit({ userId: true, dogRescueGroupsId: true })

export type UpdateAdoptionAgreementInput = z.input<typeof updateAdoptionAgreementSchema>
export type UpdateAdoptionAgreementValues = z.output<typeof updateAdoptionAgreementSchema>

// ── Adopter: signing ──────────────────────────────────────────────────────

export const adopterDetailsSchema = z.object({
  firstName: requiredText('First name', 60),
  lastName: requiredText('Last name', 60),
  phone: z
    .string()
    .trim()
    .refine((v) => v.replace(/\D/g, '').length >= 10, 'Enter a phone number with area code'),
  addressLine1: requiredText('Street address', 120),
  addressLine2: optionalText(120),
  city: requiredText('City', 80),
  state: requiredText('State', 50),
  zipPostalCode: z.string().trim().regex(ZIP_PATTERN, 'Enter a 5-digit ZIP code')
})

export type AdopterDetailsInput = z.input<typeof adopterDetailsSchema>
export type AdopterDetailsValues = z.output<typeof adopterDetailsSchema>

export const signTermsSchema = z.object({
  agreementId: z.string().min(1),
  loadedAt,
  typedName: signature('Signature'),
  agreed: mustAgree('Check the box to agree to statements 1 through 20')
})

export type SignTermsInput = z.input<typeof signTermsSchema>
export type SignTermsValues = z.output<typeof signTermsSchema>

export const signFinancialSchema = z.object({
  agreementId: z.string().min(1),
  loadedAt,
  firstAdopterName: signature('First adopter signature'),
  secondAdopterName: z
    .string()
    .trim()
    .max(120)
    .optional()
    .refine((v) => !v || v.length >= 2, 'Type the full name, or leave it blank')
    .transform((v) => v || null),
  additionalDonation: optionalMoney,
  agreed: mustAgree('Check the box to agree to the financial terms')
})

export type SignFinancialInput = z.input<typeof signFinancialSchema>
export type SignFinancialValues = z.output<typeof signFinancialSchema>

// ── Adopter: paying ───────────────────────────────────────────────────────

/** The donation can change up until payment, since it's a gift on top of the agreed fees. */
export const updateAgreementDonationSchema = z.object({
  agreementId: z.string().min(1),
  additionalDonation: optionalMoney
})

// ── Admin: completing ─────────────────────────────────────────────────────

/** For Zelle, Venmo and PayPal. The method comes from the agreement; card payments are recorded by the webhook. */
export const markAgreementPaidSchema = z.object({
  agreementId: z.string().min(1),
  receivedOn: optionalDate,
  reference: optionalText(200)
})

export type MarkAgreementPaidInput = z.input<typeof markAgreementPaidSchema>
export type MarkAgreementPaidValues = z.output<typeof markAgreementPaidSchema>

export const countersignAgreementSchema = z.object({
  agreementId: z.string().min(1),
  typedName: signature('Signature'),
  agreed: mustAgree('Check the box to sign for Little Paws')
})

export type CountersignAgreementInput = z.input<typeof countersignAgreementSchema>
export type CountersignAgreementValues = z.output<typeof countersignAgreementSchema>

/** Voiding and returning both ask why, so the record explains itself later. */
export const closeAgreementSchema = z.object({
  agreementId: z.string().min(1),
  reason: requiredText('Reason', 500)
})

export type CloseAgreementInput = z.input<typeof closeAgreementSchema>
export type CloseAgreementValues = z.output<typeof closeAgreementSchema>
