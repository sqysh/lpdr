import Stripe from 'stripe'

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Unknown error'
}

// A refusal the user caused and can fix, as opposed to something breaking. Logged as a warning, not an error
export class UserFacingError extends Error {}

const GENERIC_ERROR = 'Something went wrong. Please try again in a moment, or email lpdr@littlepawsdr.org if it keeps happening.'

/** Errors whose own text is written for the person on the screen: our refusals, and Stripe's card
 *  errors, which Stripe words for the cardholder ("Your card was declined"). Also decides warn vs error */
export function isExpectedError(error: unknown): boolean {
  return error instanceof UserFacingError || error instanceof Stripe.errors.StripeCardError
}

/** What to show the user. Anything not written for them gets a plain message, so raw Stripe,
 *  database or network errors never reach the screen. The full text still belongs in the log */
export function getUserMessage(error: unknown, fallback = GENERIC_ERROR): string {
  return isExpectedError(error) ? getErrorMessage(error) : fallback
}
