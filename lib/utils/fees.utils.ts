const STRIPE_PERCENT = 0.029
const STRIPE_FIXED_CENTS = 30

/** Amount the donor pays so the rescue nets `baseCents` after Stripe fees. */
export const grossUpCents = (baseCents: number) =>
  Math.round((baseCents + STRIPE_FIXED_CENTS) / (1 - STRIPE_PERCENT))

/** The fee portion only, in dollars — for display. */
export const calculateStripeFees = (amount: number) => {
  if (!amount || amount <= 0) return 0
  const baseCents = Math.round(amount * 100)
  return (grossUpCents(baseCents) - baseCents) / 100
}
