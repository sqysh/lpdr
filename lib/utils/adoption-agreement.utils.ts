import { ordinal } from './date.utils'

/**
 * RescueGroups stores the fee as display text ("$450", "$1,200.00"). Some listings carry text instead
 * of an amount ("Contact us"), which returns null so the admin is told to fix it at the source.
 */
export function parseAdoptionFee(feeString: string | null | undefined): number | null {
  if (!feeString) return null

  const match = feeString.replace(/,/g, '').match(/\d+(\.\d{1,2})?/)
  if (!match) return null

  const amount = Number(match[0])
  return Number.isFinite(amount) && amount > 0 ? amount : null
}

// Subtotal before any card fees. One place, so the admin list, the adopter's page and the payment agree
export function agreementTotal(a: { adoptionFee: number; healthCertificateFee: number | null; additionalDonation: number | null }) {
  return Number(a.adoptionFee) + Number(a.healthCertificateFee ?? 0) + Number(a.additionalDonation ?? 0)
}

// Contracts fill the date as "this 23rd day of September, 2026" rather than a plain date
export const agreementDate = (d: Date) =>
  `${ordinal(d.getDate())} day of ${d.toLocaleDateString('en-US', { month: 'long' })}, ${d.getFullYear()}`
