/**
 * Formats as the user types: 6175 → (617) 5, 6175551234 → (617) 555-1234. A leading 1 is dropped
 * so pasting +1 617 555 1234 lands in the same shape.
 */
export function formatPhone(value: string) {
  let digits = value.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1)
  digits = digits.slice(0, 10)

  if (digits.length === 0) return ''
  if (digits.length < 4) return `(${digits}`
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}
